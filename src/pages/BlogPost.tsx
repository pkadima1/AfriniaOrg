import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, ArrowLeft, MessageCircle, Reply } from 'lucide-react';
import { fetchBlogPosts, fetchComments, addComment, fetchGoogleDocContent, type BlogPost as BlogPostType, Comment } from '@/utils/googleSheetsApi';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comment form state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [commentStatus, setCommentStatus] = useState('');
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
      const blogPosts = await fetchBlogPosts();
      const foundPost = blogPosts.find(p => p.slug === slug);
      
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
      const fetchedComments = await fetchComments(slug);
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
      const success = await addComment({
        postSlug: slug,
        name: commentName,
        email: commentEmail,
        message: commentMessage,
        parentId: replyingTo || undefined
      });
      
      if (success) {
        // Create temporary comment for immediate display
        const tempComment: Comment = {
          id: Date.now().toString(),
          postSlug: slug,
          name: commentName,
          email: commentEmail,
          message: commentMessage,
          date: new Date().toISOString(),
          parentId: replyingTo || undefined
        };
        
        if (replyingTo) {
          const updatedComments = comments.map(comment => {
            if (comment.id === replyingTo) {
              return {
                ...comment,
                replies: [...(comment.replies || []), tempComment]
              };
            }
            return comment;
          });
          setComments(updatedComments);
        } else {
          setComments([...comments, tempComment]);
        }
        
        setCommentName('');
        setCommentEmail('');
        setCommentMessage('');
        setReplyingTo(null);
        setCommentStatus(replyingTo ? 'Reply posted!' : 'Comment posted!');
        
        setTimeout(() => setCommentStatus(''), 5000);
      } else {
        setCommentStatus('Error posting comment. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      setCommentStatus('Error submitting comment. Please try again.');
    }
    setSubmitting(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=400&fit=crop";
  };

  const handleReply = (commentId: string) => {
    setReplyingTo(commentId);
    setCommentStatus('');
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setCommentMessage('');
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div key={comment.id} className={`${isReply ? 'ml-8 border-l-2 border-accent-blue pl-4' : 'border-l-2 border-accent-blue pl-4'} mb-6`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-semibold">{comment.name}</span>
          <span className="text-sm text-gray-400">
            {new Date(comment.date).toLocaleDateString()}
          </span>
        </div>
        {!isReply && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleReply(comment.id)}
            className="text-accent-blue hover:text-accent-purple"
          >
            <Reply className="w-4 h-4 mr-1" />
            Reply
          </Button>
        )}
      </div>
      <p className="text-gray-300 mb-2">{comment.message}</p>
      
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
          <h1 className="text-2xl font-bold mb-4">Blog post not found</h1>
          <Link to="/blog">
            <Button className="apple-button">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
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
          Back to Blog
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
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCommentSubmit} className="space-y-4 mb-8">
              {replyingTo && (
                <div className="bg-accent-blue/10 border border-accent-blue/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-accent-blue">Replying to comment</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cancelReply}
                      className="text-gray-400 hover:text-white"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Name (required)"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  required
                  disabled={submitting}
                />
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  disabled={submitting}
                />
              </div>
              <Textarea
                placeholder={replyingTo ? "Write your reply..." : "Your message"}
                rows={4}
                value={commentMessage}
                onChange={(e) => setCommentMessage(e.target.value)}
                required
                disabled={submitting}
              />
              <Button type="submit" className="apple-button" disabled={submitting}>
                {submitting ? 'Posting...' : (replyingTo ? 'Post Reply' : 'Post Comment')}
              </Button>
              {commentStatus && (
                <p className="text-accent-blue">{commentStatus}</p>
              )}
            </form>

            <div className="space-y-6">
              {comments.filter(c => !c.parentId).map(comment => renderComment(comment))}
              {comments.filter(c => !c.parentId).length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Comment Storage Setup</h3>
          <p className="text-sm text-blue-300 mb-2">
            Comments are currently logged to console in the correct format for your Google Sheet. 
            To automatically save comments, you need to create a Google Apps Script Web App.
          </p>
          <p className="text-sm text-blue-200 mb-2">
            Create a "Comments" sheet with columns: PostSlug (A), CommentID (B), Name (C), Email (D), Message (E), Date (F), ParentID (G)
          </p>
          <p className="text-sm text-blue-300">
            Check browser console to see the exact data format for manual entry or Google Apps Script integration.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPost;
