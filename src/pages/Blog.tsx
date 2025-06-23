
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, User, Tag } from 'lucide-react';
import { fetchBlogPosts, BlogPost } from '@/utils/googleSheetsApi';

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [email, setEmail] = useState('');
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    loadBlogPosts();
  }, []);

  const loadBlogPosts = async () => {
    try {
      const blogPosts = await fetchBlogPosts();
      if (blogPosts.length > 0) {
        setPosts(blogPosts.slice(0, 6));
      } else {
        // Fallback sample data
        setPosts([
          {
            title: "Getting Started with AI Content Creation",
            slug: "getting-started-ai-content",
            author: "NodeMatics Team",
            date: "2024-01-15",
            category: "AI Tools",
            summary: "Learn how to leverage AI for creating high-quality, engaging content that ranks well in search engines.",
            publishedDocURL: "https://docs.google.com/document/d/your-doc-id/pub",
            featuredImageURL: "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop"
          },
          {
            title: "SEO Best Practices for 2024",
            slug: "seo-best-practices-2024",
            author: "SEO Expert",
            date: "2024-01-10",
            category: "SEO",
            summary: "Discover the latest SEO techniques and strategies that will help your content rank higher in search results.",
            publishedDocURL: "https://docs.google.com/document/d/your-doc-id/pub",
            featuredImageURL: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&h=400&fit=crop"
          }
        ]);
      }
    } catch (error) {
      console.error('Error loading blog posts:', error);
    }
    setLoading(false);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribing(true);
    try {
      // Send to n8n webhook with no-cors mode
      const webhookResponse = await fetch('https://engageperfect.app.n8n.cloud/webhook/b6b9ad0f-ab8a-439c-b213-e6b3d5c24d59', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        mode: 'no-cors',
        body: JSON.stringify({
          type: 'newsletter_subscription',
          email: email,
          subscribed_at: new Date().toISOString()
        }),
      });

      console.log('Newsletter webhook request sent (no-cors mode)');
      
      setSubscribeMessage('Thank you for subscribing! You\'ll receive our weekly articles.');
      setEmail('');
      setTimeout(() => setSubscribeMessage(''), 5000);
      
    } catch (error) {
      console.error('Error subscribing:', error);
      setSubscribeMessage('Error subscribing. Please try again.');
      setTimeout(() => setSubscribeMessage(''), 5000);
    }
    setSubscribing(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const target = e.target as HTMLImageElement;
    target.src = "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop";
  };

  if (loading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 gradient-text">NodeMatics Blog</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Insights, tips, and strategies for modern content creation and SEO optimization
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {posts.map((post) => (
            <Card key={post.slug} className="glass-effect card-hover">
              {post.featuredImageURL && (
                <div className="aspect-video overflow-hidden rounded-t-lg">
                  <img 
                    src={post.featuredImageURL || "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=400&fit=crop"} 
                    alt={post.title}
                    className="w-full h-full object-cover"
                    onError={handleImageError}
                  />
                </div>
              )}
              <CardHeader>
                <div className="flex items-center gap-4 text-sm text-gray-400 mb-2">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {post.author}
                  </div>
                </div>
                <CardTitle className="text-xl mb-2">{post.title}</CardTitle>
                <div className="flex items-center gap-1 text-sm text-accent-blue">
                  <Tag className="w-4 h-4" />
                  {post.category}
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-300 mb-4">{post.summary}</p>
                <Link to={`/blog/${post.slug}`}>
                  <Button className="apple-button w-full">
                    Read More
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <Card className="glass-effect max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">Subscribe to Weekly Articles</CardTitle>
            <p className="text-gray-400">
              Get the latest insights and tips delivered to your inbox every week
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubscribe} className="flex gap-4">
              <Input
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                disabled={subscribing}
              />
              <Button type="submit" className="apple-button" disabled={subscribing}>
                {subscribing ? 'Subscribing...' : 'Subscribe'}
              </Button>
            </form>
            {subscribeMessage && (
              <p className="text-center mt-4 text-accent-blue">{subscribeMessage}</p>
            )}
            <div className="mt-4 p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-300">
                <strong>Setup needed:</strong> To enable email subscriptions, create a Google Apps Script Web App or Google Form connected to your sheet. 
                <a href="https://developers.google.com/apps-script/guides/web" target="_blank" rel="noopener noreferrer" className="text-accent-blue hover:underline ml-1">
                  Learn more
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Blog;
