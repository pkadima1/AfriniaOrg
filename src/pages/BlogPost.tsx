
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, User, ArrowLeft, MessageCircle } from 'lucide-react';

interface BlogPost {
  title: string;
  slug: string;
  author: string;
  date: string;
  category: string;
  summary: string;
  publishedDocURL: string;
  featuredImageURL: string;
}

interface Comment {
  name: string;
  email?: string;
  message: string;
  date: string;
}

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [content, setContent] = useState('');
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Comment form state
  const [commentName, setCommentName] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentMessage, setCommentMessage] = useState('');
  const [commentStatus, setCommentStatus] = useState('');

  useEffect(() => {
    if (slug) {
      fetchBlogPost();
    }
  }, [slug]);

  const fetchBlogPost = async () => {
    try {
      // In a real implementation, you'd fetch from Google Sheets
      // For demo, using sample data
      const samplePost = {
        title: "Getting Started with AI Content Creation",
        slug: "getting-started-ai-content",
        author: "NodeMatics Team",
        date: "2024-01-15",
        category: "AI Tools",
        summary: "Learn how to leverage AI for creating high-quality, engaging content that ranks well in search engines.",
        publishedDocURL: "https://docs.google.com/document/d/your-doc-id/pub",
        featuredImageURL: "/placeholder.svg"
      };
      
      setPost(samplePost);
      
      // Fetch content from Google Doc (if URL provided)
      if (samplePost.publishedDocURL && samplePost.publishedDocURL !== "https://docs.google.com/document/d/your-doc-id/pub") {
        try {
          const response = await fetch(samplePost.publishedDocURL);
          const htmlContent = await response.text();
          setContent(htmlContent);
        } catch (error) {
          console.error('Error fetching Google Doc content:', error);
          // Fallback content
          setContent(`
            <h2>Welcome to AI Content Creation</h2>
            <p>This is a sample blog post demonstrating how your Google Docs content will be displayed. The actual content will be fetched from your published Google Document.</p>
            <h3>Key Benefits:</h3>
            <ul>
              <li>Easy content management through Google Docs</li>
              <li>Preserved formatting and styling</li>
              <li>Simple publishing workflow</li>
            </ul>
            <p>To see this in action, make sure your Google Doc is published to the web and the URL is added to your Google Sheet.</p>
          `);
        }
      } else {
        // Fallback content for demo
        setContent(`
          <h2>Welcome to AI Content Creation</h2>
          <p>This is a sample blog post demonstrating how your Google Docs content will be displayed. The actual content will be fetched from your published Google Document.</p>
          <h3>Key Benefits:</h3>
          <ul>
            <li>Easy content management through Google Docs</li>
            <li>Preserved formatting and styling</li>
            <li>Simple publishing workflow</li>
          </ul>
          <p>To see this in action, make sure your Google Doc is published to the web and the URL is added to your Google Sheet.</p>
        `);
      }
      
    } catch (error) {
      console.error('Error fetching blog post:', error);
    }
    setLoading(false);
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newComment = {
        name: commentName,
        email: commentEmail,
        message: commentMessage,
        date: new Date().toISOString()
      };
      
      // Here you would send to Google Sheets BlogComments tab
      console.log('New comment:', newComment);
      
      setComments([...comments, newComment]);
      setCommentName('');
      setCommentEmail('');
      setCommentMessage('');
      setCommentStatus('Thank you for your comment!');
      
      setTimeout(() => setCommentStatus(''), 5000);
    } catch (error) {
      console.error('Error submitting comment:', error);
      setCommentStatus('Error submitting comment. Please try again.');
    }
  };

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
        {/* Navigation */}
        <Link to="/blog" className="inline-flex items-center text-accent-blue hover:text-accent-purple mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blog
        </Link>

        {/* Article Header */}
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
                  src={post.featuredImageURL} 
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </header>

          {/* Article Content */}
          <div 
            className="prose prose-invert prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>

        {/* Comments Section */}
        <Card className="glass-effect">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              Comments ({comments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Comment Form */}
            <form onSubmit={handleCommentSubmit} className="space-y-4 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  placeholder="Name (required)"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email (optional)"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                />
              </div>
              <textarea
                className="w-full p-3 rounded-md border border-input bg-background text-foreground resize-none"
                placeholder="Your message"
                rows={4}
                value={commentMessage}
                onChange={(e) => setCommentMessage(e.target.value)}
                required
              />
              <Button type="submit" className="apple-button">
                Post Comment
              </Button>
              {commentStatus && (
                <p className="text-accent-blue">{commentStatus}</p>
              )}
            </form>

            {/* Comments List */}
            <div className="space-y-6">
              {comments.map((comment, index) => (
                <div key={index} className="border-l-2 border-accent-blue pl-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold">{comment.name}</span>
                    <span className="text-sm text-gray-400">
                      {new Date(comment.date).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-300">{comment.message}</p>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-gray-400 text-center py-8">
                  No comments yet. Be the first to comment!
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
