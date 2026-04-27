
import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { ArrowLeft, MessageCircle, Reply, Clock, User, Tag } from 'lucide-react';
import { getPostByLangAndSlug, getPostsByLanguage } from '@/integrations/firebase/blogService';
import {
  fetchCommentsForPost,
  addCommentToPost,
  type Comment,
} from '@/integrations/firebase/commentService';
import { BlogPost as FirestorePost } from '@/integrations/firebase/types';
import { useToast } from '@/hooks/use-toast';
import SocialShare from '@/components/SocialShare';
import EmojiPickerComponent from '@/components/EmojiPicker';
import {
  type Lang,
  getBlogUrl,
  getPostUrl,
  useSeoHead,
} from '@/utils/languageUtils';
import { usePageMeta } from '@/utils/pageMeta';
import {
  trackArticleView,
  trackArticleReadComplete,
  trackCommentSubmitted,
} from '@/utils/analytics';

// ── Afrinia brand tokens ──────────────────────────────────────────────────────
const A = {
  bg:     '#0f172a',
  bg2:    '#131f35',
  bg3:    '#1a2744',
  gold:   '#B8912A',
  goldLt: '#d4a83a',
  cream:  '#F5F0E8',
  muted:  '#8a9bb5',
  border: 'rgba(184,145,42,0.18)',
  serif:  "'Cormorant Garamond', Georgia, serif",
  sans:   "'Jost', 'Helvetica Neue', sans-serif",
};

interface DisplayPost {
  title: string;
  slug: string;
  author: string;
  date: string;
  category: string;
  summary: string;
  featuredImageURL: string;
  readTime: string;
  tags: string[];
}

interface RelatedCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image?: string;
  readTime: string;
  date: string;
}

function toRelatedCard(post: FirestorePost, lang: Lang): RelatedCard {
  const words = (post.excerpt || post.content || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
  const mins = Math.max(1, Math.round(words / 200));
  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt?.replace(/<[^>]+>/g, '') || post.content?.replace(/<[^>]+>/g, '').substring(0, 120) + '…' || '',
    category: post.category || 'Ideas',
    image: post.featured_image_url,
    readTime: `${mins} min${lang === 'fr' ? ' de lecture' : ' read'}`,
    date: post.published_at
      ? new Date(post.published_at).toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        })
      : '—',
  };
}

/**
 * Takes the flat array returned by Firestore and builds a nested tree.
 */
function nestComments(flat: Comment[]): Comment[] {
  const map = new Map<string, Comment>();
  flat.forEach(c => map.set(c.id, { ...c, replies: [] }));
  const roots: Comment[] = [];
  flat.forEach(c => {
    if (c.parent_id && map.has(c.parent_id)) {
      map.get(c.parent_id)!.replies!.push(map.get(c.id)!);
    } else {
      roots.push(map.get(c.id)!);
    }
  });
  return roots;
}

function formatPostDate(dateStr: string, lang: Lang): string {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? '—'
    : d.toLocaleDateString(lang === 'fr' ? 'fr-FR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
}

const BlogPost = () => {
  const { t, i18n } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const { pathname } = useLocation();
  const { toast } = useToast();

  const lang: Lang = pathname.startsWith('/fr/') ? 'fr' : 'en';

  useEffect(() => {
    if (i18n.language !== lang) void i18n.changeLanguage(lang);
  }, [lang, i18n]);

  const [post, setPost] = useState<DisplayPost | null>(null);
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [relatedPosts, setRelatedPosts] = useState<RelatedCard[]>([]);

  // Comment form state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Refs for article_read_complete tracking.
  // articleEndRef marks the bottom of the article body — observed by an
  // IntersectionObserver below. hasTrackedReadRef prevents the event firing
  // more than once per article (e.g. if user scrolls down and back up).
  const articleEndRef = useRef<HTMLDivElement>(null);
  const hasTrackedReadRef = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (slug) {
      void loadBlogPost();
      void loadComments(true);
    }
  }, [slug, lang]);

  // Fire article_read_complete when the reader scrolls to the bottom of the
  // article body. Runs after `post` is set (meaning content is rendered).
  // Fires at most once per article: the observer disconnects after first trigger
  // and hasTrackedReadRef guards against the effect re-running on re-renders.
  useEffect(() => {
    if (!post || !articleEndRef.current) return;
    hasTrackedReadRef.current = false;

    const sentinel = articleEndRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasTrackedReadRef.current) {
          hasTrackedReadRef.current = true;
          trackArticleReadComplete({ article_slug: post.slug, article_title: post.title });
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [post]);

  const loadBlogPost = async () => {
    setLoading(true);
    try {
      const firebasePost = await getPostByLangAndSlug(lang, slug || '');

      if (firebasePost) {
        const words = (firebasePost.content || '').replace(/<[^>]+>/g, '').split(/\s+/).length;
        const mins = Math.max(1, Math.round(words / 200));

        setPost({
          title: firebasePost.title,
          slug: firebasePost.slug,
          author: firebasePost.author_name,
          date: firebasePost.published_at
            ? firebasePost.published_at.split('T')[0]
            : firebasePost.created_at?.split('T')[0] ?? '',
          category: firebasePost.category || 'Ideas',
          summary: (firebasePost.excerpt || firebasePost.content || '').replace(/<[^>]+>/g, '').substring(0, 200).trim() || '',
          featuredImageURL: firebasePost.featured_image_url || '',
          readTime: `${mins} min${lang === 'fr' ? ' de lecture' : ' read'}`,
          tags: firebasePost.tags ?? [],
        });

        const bodyContent = firebasePost.content?.trim();
        if (bodyContent) {
          setContent(bodyContent);
        } else if (firebasePost.content_storage_path) {
          setContent(
            '<p style="color:#8a9bb5;font-family:Jost,sans-serif">Content is stored in Firebase Storage. Ensure CORS is configured on the bucket.</p>'
          );
        } else {
          setContent('<p style="color:#8a9bb5;font-family:Jost,sans-serif">No content available.</p>');
        }

        trackArticleView({
          article_slug: firebasePost.slug,
          article_title: firebasePost.title,
          article_lang: lang,
          article_category: firebasePost.category || 'Ideas',
        });

        // Fetch related posts
        void loadRelated(firebasePost.slug, firebasePost.category);
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
      setContent('<p style="color:#8a9bb5;font-family:Jost,sans-serif">Error loading post.</p>');
    }
    setLoading(false);
  };

  const loadRelated = async (currentSlug: string, category?: string) => {
    try {
      const all = await getPostsByLanguage(lang, { status: 'published' });
      const others = all.filter(p => p.slug !== currentSlug);
      // Prefer same category
      const sameCategory = others.filter(p => p.category === category);
      const picks = sameCategory.length >= 2
        ? sameCategory.slice(0, 3)
        : [...sameCategory, ...others.filter(p => p.category !== category)].slice(0, 3);
      setRelatedPosts(picks.map(p => toRelatedCard(p, lang)));
    } catch {
      // silently ignore
    }
  };

  const loadComments = async (replaceIfEmpty = false) => {
    if (!slug) return;
    try {
      const fetched = await fetchCommentsForPost(slug, lang);
      if (fetched.length > 0 || replaceIfEmpty) {
        setComments(nestComments(fetched));
      }
    } catch (error) {
      console.error('Error loading comments:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !commentName.trim() || !commentMessage.trim()) return;

    setSubmitting(true);
    try {
      const newId = await addCommentToPost(
        slug, lang, commentName.trim(), commentMessage.trim(),
        commentEmail.trim() || undefined, replyingTo || undefined,
      );

      if (newId) {
        const optimistic: Comment = {
          id: newId, post_slug: slug, lang,
          name: commentName.trim(),
          email: commentEmail.trim() || undefined,
          message: commentMessage.trim(),
          parent_id: replyingTo || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          replies: [],
        };

        if (replyingTo) {
          setComments(prev =>
            prev.map(c =>
              c.id === replyingTo ? { ...c, replies: [...(c.replies || []), optimistic] } : c,
            ),
          );
        } else {
          setComments(prev => [optimistic, ...prev]);
        }

        setCommentName(''); setCommentEmail(''); setCommentMessage(''); setReplyingTo(null);
        toast({ title: replyingTo ? 'Reply posted.' : 'Comment posted.' });
        trackCommentSubmitted({ article_slug: slug, article_lang: lang });
        void loadComments();
      } else {
        toast({ title: 'Error posting comment.', variant: 'destructive' });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({ title: 'Error posting comment.', variant: 'destructive' });
    }
    setSubmitting(false);
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      style={{
        borderLeft: `2px solid ${isReply ? A.border : A.gold}`,
        paddingLeft: 20, marginLeft: isReply ? 32 : 0,
        marginBottom: 28, opacity: isReply ? 0.85 : 1,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontFamily: A.sans, fontSize: 13, fontWeight: 500, color: A.cream }}>
            {comment.name}
          </span>
          <span style={{ fontFamily: A.sans, fontSize: 11, color: A.muted }}>
            {formatPostDate(comment.created_at, lang)}
          </span>
        </div>
        {!isReply && (
          <button
            onClick={() => setReplyingTo(comment.id)}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 4,
              fontFamily: A.sans, fontSize: 11, color: A.muted, transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = A.gold)}
            onMouseLeave={e => (e.currentTarget.style.color = A.muted)}
          >
            <Reply size={13} />
            {t('blog.comments.reply', 'Reply')}
          </button>
        )}
      </div>
      <p style={{ fontFamily: A.sans, fontSize: 14, fontWeight: 300, color: A.muted, lineHeight: 1.7, margin: 0 }}>
        {comment.message}
      </p>
      {comment.replies && comment.replies.length > 0 && (
        <div style={{ marginTop: 16 }}>
          {comment.replies.map(r => renderComment(r, true))}
        </div>
      )}
    </div>
  );

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://afrinia.org';
  const currentSlug = slug || '';
  const postUrl = `${origin}/${lang}/blog/${currentSlug}`;

  useSeoHead(
    `${origin}/en/blog/${currentSlug}`,
    `${origin}/fr/blog/${currentSlug}`,
    postUrl,
  );

  // Dynamic per-post meta tags + JSON-LD Article schema
  usePageMeta({
    title: post
      ? `${post.title} | Afrinia`
      : lang === 'fr' ? 'Afrinia — Flux d\'Intelligence' : 'Afrinia Intelligence Feed',
    description: post?.summary ||
      (lang === 'fr'
        ? 'Explorez les dernières idées d\'Afrinia pour les bâtisseurs africains.'
        : 'Explore the latest ideas from Afrinia for Africa\'s builders.'),
    ogUrl: postUrl,
    ogImage: post?.featuredImageURL || undefined,
    jsonLd: post
      ? {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: post.title,
          description: post.summary,
          // Omit image when no cover exists — a missing field is valid schema;
          // a pointer to a non-existent file is an error Google will flag.
          ...(post.featuredImageURL ? { image: post.featuredImageURL } : {}),
          url: postUrl,
          inLanguage: lang === 'fr' ? 'fr' : 'en',
          datePublished: post.date,
          dateModified: post.date,
          author: {
            '@type': 'Organization',
            name: 'Afrinia',
            url: 'https://afrinia.org',
          },
          publisher: {
            '@type': 'Organization',
            '@id': 'https://afrinia.org/#organization',
            name: 'Afrinia',
            url: 'https://afrinia.org',
          },
          keywords: post.tags.join(', '),
          isPartOf: {
            '@type': 'Blog',
            '@id': `${origin}/${lang}/blog`,
            name: lang === 'fr' ? 'Afrinia — Flux d\'Intelligence' : 'Afrinia Intelligence Feed',
          },
        }
      : undefined,
  });

  if (loading) {
    return (
      <Layout>
        <div style={{ paddingTop: 68, minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="page-container section-center-md" style={{ maxWidth: 700 }}>
            <div style={{ width: '40%', height: 10, background: A.bg3, marginBottom: 20 }} />
            <div style={{ width: '90%', height: 32, background: A.bg3, marginBottom: 12 }} />
            <div style={{ width: '70%', height: 32, background: A.bg3, marginBottom: 32 }} />
            {[1, 2, 3].map(i => (
              <div key={i} style={{ width: '100%', height: 14, background: A.bg3, marginBottom: 10 }} />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div style={{
          paddingTop: 120, minHeight: '50vh',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 24,
        }}>
          <p style={{ fontFamily: A.serif, fontSize: 28, fontWeight: 300, color: A.muted }}>
            {lang === 'fr' ? 'Article introuvable.' : 'Post not found.'}
          </p>
          <Link
            to={getBlogUrl(lang)}
            style={{
              fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
              letterSpacing: '2.5px', textTransform: 'uppercase',
              color: A.gold, textDecoration: 'none',
              border: `1px solid ${A.gold}`, padding: '12px 28px',
            }}
          >
            ← {t('blog.notFound.button', 'Back to Ideas')}
          </Link>
        </div>
      </Layout>
    );
  }

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';

  return (
    <Layout>
      {/* ── Post header hero ── */}
      <div style={{
        position: 'relative', display: 'flex', alignItems: 'center',
        backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/modified-hull-203004-d8ktc/o/Media%2F20260124_1818_Image%20Generation_simple_compose_01kfrcrxdmeqwvk17njx6yj8vt.png?alt=media&token=3f88282d-9495-4e54-94a4-704895b14794')`,
        backgroundSize: 'cover', backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat', backgroundColor: A.bg,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at 50% 60%, rgba(15,23,42,0.35) 0%, rgba(15,23,42,0.72) 35%, rgba(15,23,42,0.94) 75%, rgba(15,23,42,1) 100%)',
        }} />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: `linear-gradient(to bottom, transparent, ${A.bg})`,
        }} />

        <div className="page-container section-center-md" style={{
          position: 'relative', zIndex: 1,
          padding: '72px 0 64px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 18,
          maxWidth: 920, margin: '0 auto',
        }}>
          <div style={{
            fontFamily: A.sans, fontSize: '9px', fontWeight: 500,
            letterSpacing: '4px', textTransform: 'uppercase',
            color: A.gold, marginBottom: 12,
            textShadow: '0 1px 8px rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 18px', borderRadius: 999,
            background: 'rgba(15,23,42,0.58)', backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ display: 'inline-block', width: 20, height: 1, background: 'rgba(184,145,42,0.7)' }} />
            {lang === 'fr' ? "Flux d\u2019intelligence Afrinia" : 'Afrinia Intelligence Feed'}
            <span style={{ display: 'inline-block', width: 20, height: 1, background: 'rgba(184,145,42,0.7)' }} />
          </div>
        </div>
      </div>

      {/* ── Article body ── */}
      <div className="section-md" style={{ background: A.bg }}>
        <div className="page-container section-center-md">

          <Link
            to={getBlogUrl(lang)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
              letterSpacing: '1.5px', textTransform: 'uppercase',
              color: A.muted, textDecoration: 'none',
              padding: '28px 0', transition: 'color 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.color = A.gold)}
            onMouseLeave={e => (e.currentTarget.style.color = A.muted)}
          >
            <ArrowLeft size={13} />
            {t('blog.backToBlog', 'All Ideas')}
          </Link>

          <article>
            <header style={{ marginBottom: 40 }}>
              {/* Category pill */}
              {post.category && (
                <div style={{ marginBottom: 16 }}>
                  <span style={{
                    fontFamily: A.sans, fontSize: '9px', fontWeight: 500,
                    letterSpacing: '2.5px', textTransform: 'uppercase',
                    color: A.gold, border: `1px solid rgba(184,145,42,0.35)`,
                    padding: '4px 12px', borderRadius: 2,
                  }}>{post.category}</span>
                </div>
              )}

              <h1 style={{
                fontFamily: A.serif,
                fontSize: 'clamp(32px,4vw,52px)',
                fontWeight: 300, color: A.cream,
                lineHeight: 1.2, marginBottom: 24,
              }}>{post.title}</h1>

              {/* ── Metadata strip ── */}
              <div style={{
                display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 20,
                padding: '16px 20px',
                background: A.bg2,
                border: `1px solid ${A.border}`,
                borderRadius: 4,
                marginBottom: 28,
              }}>
                {/* Read time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                  <Clock size={13} style={{ color: A.gold, flexShrink: 0 }} />
                  <span style={{ fontFamily: A.sans, fontSize: 13, fontWeight: 400, color: A.cream }}>
                    {post.readTime}
                  </span>
                </div>

                <span style={{ width: 1, height: 16, background: A.border, display: 'inline-block' }} />

                {/* Author */}
                {post.author && (
                  <>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <User size={13} style={{ color: A.gold, flexShrink: 0 }} />
                      <span style={{ fontFamily: A.sans, fontSize: 13, fontWeight: 400, color: A.cream }}>
                        {post.author}
                      </span>
                    </div>
                    <span style={{ width: 1, height: 16, background: A.border, display: 'inline-block' }} />
                  </>
                )}

                {/* Date */}
                <span style={{ fontFamily: A.sans, fontSize: 13, fontWeight: 300, color: A.muted }}>
                  {formatPostDate(post.date, lang)}
                </span>

                {/* Tags */}
                {post.tags.length > 0 && (
                  <>
                    <span style={{ width: 1, height: 16, background: A.border, display: 'inline-block' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7, flexWrap: 'wrap' }}>
                      <Tag size={12} style={{ color: A.gold, flexShrink: 0 }} />
                      {post.tags.map(tag => (
                        <span key={tag} style={{
                          fontFamily: A.sans, fontSize: '11px', fontWeight: 300,
                          color: A.muted, background: A.bg3,
                          border: `1px solid ${A.border}`,
                          padding: '2px 8px', borderRadius: 2,
                        }}>{tag}</span>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {post.summary && (
                <p style={{
                  fontFamily: A.sans, fontSize: 16, fontWeight: 300,
                  color: '#c8d8e8', lineHeight: 1.8,
                  borderLeft: `2px solid ${A.gold}`,
                  paddingLeft: 20, marginBottom: 32,
                }}>{post.summary}</p>
              )}

              {post.featuredImageURL && (
                <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', marginBottom: 8 }}>
                  <img
                    src={post.featuredImageURL}
                    alt={post.title}
                    loading="eager"
                    fetchPriority="high"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                    onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}
            </header>

            <div
              className="blog-post-content prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />

            {/* Sentinel: IntersectionObserver watches this to fire article_read_complete */}
            <div ref={articleEndRef} aria-hidden="true" />

            <div style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${A.border}` }}>
              <SocialShare title={post.title} url={currentUrl} description={post.summary} />
            </div>
          </article>

          {/* ── Read Next ── */}
          {relatedPosts.length > 0 && (
            <section style={{ marginTop: 72, paddingTop: 48, borderTop: `1px solid ${A.border}` }}>
              <div style={{ marginBottom: 36 }}>
                <p style={{
                  fontFamily: A.sans, fontSize: '9px', fontWeight: 500,
                  letterSpacing: '4px', textTransform: 'uppercase',
                  color: A.gold, marginBottom: 10,
                }}>
                  {lang === 'fr' ? 'Lire ensuite' : 'Read next'}
                </p>
                <h2 style={{
                  fontFamily: A.serif, fontSize: 'clamp(22px,3vw,32px)',
                  fontWeight: 300, color: A.cream, lineHeight: 1.2,
                }}>
                  {lang === 'fr' ? "D\u2019autres id\u00e9es pour les b\u00e2tisseurs" : "More ideas for Africa\u2019s builders"}
                </h2>
              </div>

              <div id="read-next-grid">
                {relatedPosts.map(card => (
                  <Link
                    key={card.id}
                    to={getPostUrl(lang, card.slug)}
                    style={{ textDecoration: 'none' }}
                  >
                    <article style={{
                      background: A.bg2,
                      border: `1px solid ${A.border}`,
                      borderRadius: 12, overflow: 'hidden',
                      height: '100%', display: 'flex', flexDirection: 'column',
                      transition: 'border-color 0.25s',
                    }}
                      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(184,145,42,0.5)')}
                      onMouseLeave={e => (e.currentTarget.style.borderColor = A.border)}
                    >
                      {card.image && (
                        <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden' }}>
                          <img
                            src={card.image}
                            alt={card.title}
                            loading="lazy"
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>
                      )}
                      <div style={{ padding: '20px 22px 24px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                          <span style={{
                            fontFamily: A.sans, fontSize: '9px', fontWeight: 500,
                            letterSpacing: '2px', textTransform: 'uppercase',
                            color: A.gold, border: `1px solid rgba(184,145,42,0.25)`,
                            padding: '2px 8px',
                          }}>{card.category}</span>
                          <span style={{ fontFamily: A.sans, fontSize: '11px', color: A.muted }}>{card.readTime}</span>
                        </div>
                        <h3 style={{
                          fontFamily: A.serif, fontSize: 'clamp(16px,2vw,20px)',
                          fontWeight: 400, color: A.cream, lineHeight: 1.3,
                          marginBottom: 10, flex: 1,
                        }}>{card.title}</h3>
                        <p style={{
                          fontFamily: A.sans, fontSize: 12, fontWeight: 300,
                          color: A.muted, lineHeight: 1.65,
                          display: '-webkit-box', WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical', overflow: 'hidden',
                          marginBottom: 14,
                        }}>{card.excerpt}</p>
                        <span style={{
                          fontFamily: A.sans, fontSize: '10px', fontWeight: 500,
                          letterSpacing: '1.5px', textTransform: 'uppercase',
                          color: A.gold,
                        }}>{lang === 'fr' ? 'Lire →' : 'Read →'}</span>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* ── Comments ── */}
          <section style={{ marginTop: 64 }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 40, paddingBottom: 20,
              borderBottom: `1px solid ${A.border}`,
            }}>
              <MessageCircle size={16} style={{ color: A.gold }} />
              <span style={{ fontFamily: A.sans, fontSize: '10px', fontWeight: 500, letterSpacing: '2px', textTransform: 'uppercase', color: A.cream }}>
                {t('blog.comments.count', { count: comments.filter(c => !c.parent_id).length })}
              </span>
            </div>

            {/* Comment form */}
            <form onSubmit={handleCommentSubmit} style={{ marginBottom: 48 }}>
              {replyingTo && (
                <div style={{
                  background: A.bg2, border: `1px solid ${A.border}`,
                  padding: '12px 16px', marginBottom: 16,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <span style={{ fontFamily: A.sans, fontSize: 12, color: A.gold }}>
                    {t('blog.comments.replyingTo', 'Replying to a comment')}
                  </span>
                  <button
                    type="button"
                    onClick={() => { setReplyingTo(null); setCommentMessage(''); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: A.sans, fontSize: 11, color: A.muted }}
                  >
                    {t('blog.comments.cancel', 'Cancel')}
                  </button>
                </div>
              )}

              <div className="comment-form-grid">
                {[
                  { placeholder: t('blog.comments.name', 'Name *'), value: commentName, onChange: setCommentName, required: true, type: 'text' },
                  { placeholder: t('blog.comments.email', 'Email (optional)'), value: commentEmail, onChange: setCommentEmail, required: false, type: 'email' },
                ].map((f, i) => (
                  <input
                    key={i}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={f.value}
                    onChange={e => f.onChange(e.target.value)}
                    required={f.required}
                    disabled={submitting}
                    style={{
                      background: A.bg2, border: `1px solid ${A.border}`,
                      padding: '12px 16px', fontFamily: A.sans, fontSize: 13,
                      color: A.cream, outline: 'none', width: '100%', boxSizing: 'border-box',
                    }}
                  />
                ))}
              </div>

              <div style={{ position: 'relative', marginBottom: 16 }}>
                <textarea
                  placeholder={replyingTo
                    ? t('blog.comments.messageReply', 'Write your reply…')
                    : t('blog.comments.message', 'Write your comment…')}
                  rows={4}
                  value={commentMessage}
                  onChange={e => setCommentMessage(e.target.value)}
                  required
                  disabled={submitting}
                  style={{
                    width: '100%', background: A.bg2, border: `1px solid ${A.border}`,
                    padding: '12px 48px 12px 16px',
                    fontFamily: A.sans, fontSize: 13, color: A.cream,
                    outline: 'none', resize: 'vertical', boxSizing: 'border-box',
                  }}
                />
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <EmojiPickerComponent
                    onEmojiSelect={emoji => setCommentMessage(prev => prev + emoji)}
                    disabled={submitting}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="afrinia-btn-gold"
                style={{ fontSize: '10px', padding: '12px 28px' }}
              >
                {submitting
                  ? t('blog.comments.submitting', 'Posting…')
                  : replyingTo
                    ? t('blog.comments.submitReply', 'Post Reply')
                    : t('blog.comments.submit', 'Post Comment')}
              </button>
            </form>

            {/* Comment list */}
            <div>
              {comments.filter(c => !c.parent_id).length === 0 ? (
                <p style={{ fontFamily: A.sans, fontSize: 13, color: A.muted, textAlign: 'center', padding: '32px 0' }}>
                  {t('blog.comments.noComments', 'Be the first to leave a thought.')}
                </p>
              ) : (
                comments.filter(c => !c.parent_id).map(c => renderComment(c))
              )}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        #read-next-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 28px;
        }
        @media (max-width: 860px) {
          #read-next-grid { grid-template-columns: 1fr; }
        }
        @media (min-width: 861px) and (max-width: 1100px) {
          #read-next-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </Layout>
  );
};

export default BlogPost;
