import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, ArrowLeft, MessageCircle, Reply } from 'lucide-react';
import { fetchBlogPosts, fetchGoogleDocContent, type BlogPost as BlogPostType, Comment as GoogleComment } from '@/utils/googleSheetsApi';
import { fetchCommentsForPost, addCommentToPost, type Comment } from '@/utils/supabaseComments';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const BlogPost = () => {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { toast } = useToast();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comment form state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (slug) {
      loadBlogPost();
      loadComments();
    }
  }, [slug]);

  const loadBlogPost = async () => {
    try {
      let foundPost: BlogPostType | null = null;

      // First try to find in Supabase
      try {
        const { data: supabasePost, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('slug', slug)
          .eq('status', 'published')
          .single();

        if (!error && supabasePost) {
          foundPost = {
            title: supabasePost.title,
            slug: supabasePost.slug,
            author: supabasePost.author_name,
            date: supabasePost.published_at ? new Date(supabasePost.published_at).toISOString().split('T')[0] : supabasePost.created_at.split('T')[0],
            category: supabasePost.category || 'General',
            summary: supabasePost.excerpt || supabasePost.content?.substring(0, 150) + '...' || '',
            publishedDocURL: '', // Supabase posts don't use Google Docs
            featuredImageURL: supabasePost.featured_image_url || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop"
          };
          setPost(foundPost);
          setContent(supabasePost.content || '<p>No content available.</p>');
          setLoading(false);
          return;
        }
      } catch (supabaseError) {
        console.error('Error loading from Supabase:', supabaseError);
      }

      // If not found in Supabase, try Google Sheets
      const blogPosts = await fetchBlogPosts();
      foundPost = blogPosts.find(p => p.slug === slug) || null;
      
      if (foundPost) {
        setPost(foundPost);
        
        if (foundPost.publishedDocURL) {
          const docContent = await fetchGoogleDocContent(foundPost.publishedDocURL);
          setContent(docContent);
        } else {
          setContent('<p>No Google Doc URL provided for this post.</p>');
        }
      } else {
        // Fallback for demo
        setPost({
          title: "Sample Blog Post",
          slug: slug || '',
          author: "NodeMatics Team",
          date: "2024-01-15",
          category: "Sample",
          summary: "This is a sample blog post.",
          publishedDocURL: "",
          featuredImageURL: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop"
        });
        setContent('<h2>Sample Content</h2><p>This is sample content. Add your Google Doc URL to the sheet to see real content here.</p>');
      }
    } catch (error) {
      console.error('Error loading blog post:', error);
      setContent('<p>Error loading blog post.</p>');
    }
    setLoading(false);
  };

  const loadComments = async () => {
    if (!slug) return;
    
    try {
      const fetchedComments = await fetchCommentsForPost(slug);
      setComments(fetchedComments);
    } catch (error) {
      console.error('Error loading comments:', error);
      setComments([]);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug || !commentName.trim() || !commentMessage.trim()) return;
    
    setSubmitting(true);
    try {
      const result = await addCommentToPost({
        postSlug: slug,
        name: commentName,
        email: commentEmail,
        message: commentMessage,
        parentId: replyingTo || undefined
      });
      
      if (result.success && result.comment) {
        // Reload comments to get the latest data
        await loadComments();
        
        // Clear form
        setCommentName('');
        setCommentEmail('');
        setCommentMessage('');
        setReplyingTo(null);
        
        // Show success message
        toast({
          title: "Comment posted successfully!",
          description: replyingTo ? "Your reply has been added." : "Your comment has been posted.",
        });
      } else {
        toast({
          title: "Error posting comment",
          description: result.error || "Please try again later.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: "Error posting comment",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop";
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setCommentMessage('');
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-primary pl-4' : 'border-l-2 border-primary pl-4'} mb-6`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{comment.name}</span>
          <span className="text-sm text-muted-foreground">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
        {!isReply && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReply(comment.id)}
            className="text-primary hover:text-primary/80"
          >
            <Reply className="w-4 h-4 mr-1" />
            {t('blog.comments.reply')}
          </Button>
        )}
      </div>
      <p className="text-foreground mb-2">{comment.message}</p>
      
      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4">
          {comment.replies.map(reply => renderComment(reply, true))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded"></div>
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">{t('blog.notFound.title')}</h1>
          <Link to="/blog">
            <Button className="apple-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('blog.notFound.button')}
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Link to="/blog" className="inline-flex items-center text-accent-blue hover:text-accent-purple mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('blog.backToBlog')}
        </Link>

        <article className="mb-12">
          <header className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
            <div className="flex items-center gap-6 text-gray-400 mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                {post.author}
              </div>
            </div>
            {post.featuredImageURL && (
              <div className="aspect-video overflow-hidden rounded-lg mb-8">
                <img 
                  src={post.featuredImageURL || "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop"} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
              </div>
            )}
          </header>

          <div 
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>

        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              {t('blog.comments.count', { count: comments.length })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCommentSubmit} className="space-y-4 mb-8">
              {replyingTo && (
                <div className="bg-primary/10 border border-primary/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-primary">{t('blog.comments.replyingTo')}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cancelReply}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      {t('blog.comments.cancel')}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder={t('blog.comments.name')}
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  required
                  disabled={submitting}
                  className="max-w-full"
                />
                <Input
                  type="email"
                  placeholder={t('blog.comments.email')}
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  disabled={submitting}
                  className="max-w-full"
                />
              </div>
              <Textarea
                placeholder={replyingTo ? t('blog.comments.messageReply') : t('blog.comments.message')}
                rows={4}
                value={commentMessage}
                onChange={(e) => setCommentMessage(e.target.value)}
                required
                disabled={submitting}
                className="max-w-full"
              />
              <Button type="submit" disabled={submitting}>
                {submitting ? t('blog.comments.submitting') : (replyingTo ? t('blog.comments.submitReply') : t('blog.comments.submit'))}
              </Button>
            </form>

            <div className="space-y-6">
              {comments.filter(c => !c.parent_id).map(comment => renderComment(comment))}
              {comments.filter(c => !c.parent_id).length === 0 && (
                <p className="text-muted-foreground text-center py-8">
                  {t('blog.comments.noComments')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default BlogPost;
