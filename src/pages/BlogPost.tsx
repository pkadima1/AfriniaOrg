
import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { ArrowLeft, MessageCircle, Reply } from 'lucide-react';
import { getPostByLangAndSlug } from '@/integrations/firebase/blogService';
import {
  fetchCommentsForPost,
  addCommentToPost,
  type Comment,
} from '@/integrations/firebase/commentService';
import { useToast } from '@/hooks/use-toast';
import SocialShare from '@/components/SocialShare';
import EmojiPickerComponent from '@/components/EmojiPicker';
import {
  type Lang,
  getBlogUrl,
  useSeoHead,
} from '@/utils/languageUtils';

// ── Afrinia brand tokens ──
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
}

/**
 * Takes the flat array returned by Firestore and builds a nested tree.
 * Top-level comments have no parent_id; replies are placed inside their
 * parent's `.replies` array.
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

  // Derive lang from the static URL prefix (/fr/blog/... or /en/blog/...)
  const lang: Lang = pathname.startsWith('/fr/') ? 'fr' : 'en';

  // Sync i18n with the URL language
  useEffect(() => {
    if (i18n.language !== lang) {
      void i18n.changeLanguage(lang);
    }
  }, [lang, i18n]);

  const [post, setPost] = useState<DisplayPost | null>(null);
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  // Comment form state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (slug) {
      void loadBlogPost();
      void loadComments(true);
    }
  }, [slug, lang]);

  const loadBlogPost = async () => {
    setLoading(true);
    try {
      // Fetch ONLY from the lang-specific collection — no cross-collection fallback
      const firebasePost = await getPostByLangAndSlug(lang, slug || '');

      if (firebasePost) {
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
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
      setContent('<p style="color:#8a9bb5;font-family:Jost,sans-serif">Error loading post.</p>');
    }
    setLoading(false);
  };

  const loadComments = async (replaceIfEmpty = false) => {
    if (!slug) return;
    try {
      const fetched = await fetchCommentsForPost(slug, lang);
      // Only replace state when the result is non-empty, or caller explicitly allows it
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
        slug,
        lang,
        commentName.trim(),
        commentMessage.trim(),
        commentEmail.trim() || undefined,
        replyingTo || undefined
      );

      if (newId) {
        // Optimistically add the new comment/reply to local state so it appears immediately
        const optimistic: Comment = {
          id: newId,
          post_slug: slug,
          lang,
          name: commentName.trim(),
          email: commentEmail.trim() || undefined,
          message: commentMessage.trim(),
          parent_id: replyingTo || undefined,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          replies: [],
        };

        if (replyingTo) {
          // Nest the reply under its parent comment
          setComments(prev =>
            prev.map(c =>
              c.id === replyingTo
                ? { ...c, replies: [...(c.replies || []), optimistic] }
                : c,
            ),
          );
        } else {
          // New top-level comment — prepend to the list
          setComments(prev => [optimistic, ...prev]);
        }

        setCommentName('');
        setCommentEmail('');
        setCommentMessage('');
        setReplyingTo(null);
        toast({ title: replyingTo ? 'Reply posted.' : 'Comment posted.' });

        // Background re-fetch to sync accurate server state (won't clear if index delay)
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
        paddingLeft: 20,
        marginLeft: isReply ? 32 : 0,
        marginBottom: 28,
        opacity: isReply ? 0.85 : 1,
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
              fontFamily: A.sans, fontSize: 11, color: A.muted,
              transition: 'color 0.2s',
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

  // SEO: hreflang + canonical (falls back gracefully when post not yet loaded)
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://afrinia.com';
  const currentSlug = slug || '';
  useSeoHead(
    `${origin}/en/blog/${currentSlug}`,
    `${origin}/fr/blog/${currentSlug}`,
    `${origin}/${lang}/blog/${currentSlug}`,
  );

  // ── Loading state ──
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

  // ── Not found in this language's collection ──
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
      {/* ── Post header — blog page hero style ── */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        backgroundImage: `url('https://firebasestorage.googleapis.com/v0/b/modified-hull-203004-d8ktc/o/Media%2F20260124_1818_Image%20Generation_simple_compose_01kfrcrxdmeqwvk17njx6yj8vt.png?alt=media&token=3f88282d-9495-4e54-94a4-704895b14794')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundColor: A.bg,
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
          maxWidth: 920,
          margin: '0 auto',
        }}>
          <div style={{
            fontFamily: A.sans, fontSize: '9px', fontWeight: 500,
            letterSpacing: '4px', textTransform: 'uppercase',
            color: A.gold, marginBottom: 12,
            textShadow: '0 1px 8px rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 18px',
            borderRadius: 999,
            background: 'rgba(15,23,42,0.58)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            <span style={{ display: 'inline-block', width: 20, height: 1, background: 'rgba(184,145,42,0.7)' }} />
            {lang === 'fr' ? 'Flux d’intelligence Afrinia' : 'Afrinia Intelligence Feed'}
            <span style={{ display: 'inline-block', width: 20, height: 1, background: 'rgba(184,145,42,0.7)' }} />
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 0,
            padding: '10px 18px',
            borderRadius: 999,
            background: 'rgba(15,23,42,0.45)',
            backdropFilter: 'blur(10px)',
          }}>
            {post.category && (
              <span style={{
                fontFamily: A.sans, fontSize: '9px', fontWeight: 500,
                letterSpacing: '2.5px', textTransform: 'uppercase',
                color: A.gold, border: '1px solid rgba(184,145,42,0.4)',
                padding: '4px 12px',
                textShadow: '0 1px 8px rgba(0,0,0,0.9)',
              }}>{post.category}</span>
            )}
            <span style={{ fontFamily: A.sans, fontSize: 11, color: 'rgba(245,240,232,0.84)', textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
              {formatPostDate(post.date, lang)}
            </span>
            {post.author && (
              <span style={{ fontFamily: A.sans, fontSize: 11, color: 'rgba(245,240,232,0.84)', textShadow: '0 1px 8px rgba(0,0,0,0.9)' }}>
                {lang === 'fr' ? 'par' : 'by'} {post.author}
              </span>
            )}
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
              <h1 style={{
                fontFamily: A.serif,
                fontSize: 'clamp(32px,4vw,52px)',
                fontWeight: 300, color: A.cream,
                lineHeight: 1.2, marginBottom: 20,
              }}>{post.title}</h1>

              {post.summary && (
                <p style={{
                  fontFamily: A.sans, fontSize: 16, fontWeight: 300,
                  color: A.muted, lineHeight: 1.8,
                  borderLeft: `2px solid ${A.gold}`,
                  paddingLeft: 20, marginBottom: 32,
                }}>{post.summary}</p>
              )}

              {post.featuredImageURL && (
                <div style={{ width: '100%', aspectRatio: '16/9', overflow: 'hidden', marginBottom: 8 }}>
                  <img
                    src={post.featuredImageURL}
                    alt={post.title}
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

            <div style={{ marginTop: 48, paddingTop: 32, borderTop: `1px solid ${A.border}` }}>
              <SocialShare title={post.title} url={currentUrl} description={post.summary} />
            </div>
          </article>

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
    </Layout>
  );
};

export default BlogPost;
