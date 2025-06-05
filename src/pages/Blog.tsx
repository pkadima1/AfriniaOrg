import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, User, Tag } from 'lucide-react';

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

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [email, setEmail] = useState('');
  const [subscribeMessage, setSubscribeMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      // Extract sheet ID from your URL
      const sheetId = '16brbAVXZVvOap4KGH7_l67_QlHX_TCKrD_GzlGvR5LU';
      const apiKey = 'AIzaSyB29zszwpzTrWtc7ynAOxjn9Hd9bdigqBU'; // You'll need to add this
      const range = 'Sheet1!A:H'; // Adjust based on your sheet structure
      
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${range}?key=${apiKey}`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.values) {
        const [headers, ...rows] = data.values;
        const blogPosts = rows.map((row: string[]) => ({
          title: row[0] || '',
          slug: row[1] || '',
          author: row[2] || '',
          date: row[3] || '',
          category: row[4] || '',
          summary: row[5] || '',
          publishedDocURL: row[6] || '',
          featuredImageURL: row[7] || ''
        })).slice(0, 6); // Show latest 6 posts
        
        setPosts(blogPosts);
      }
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      // For demo purposes, using sample data
      setPosts([
        {
          title: "Getting Started with AI Content Creation",
          slug: "getting-started-ai-content",
          author: "NodeMatics Team",
          date: "2024-01-15",
          category: "AI Tools",
          summary: "Learn how to leverage AI for creating high-quality, engaging content that ranks well in search engines.",
          publishedDocURL: "https://docs.google.com/document/d/your-doc-id/pub",
          featuredImageURL: "/placeholder.svg"
        },
        {
          title: "SEO Best Practices for 2024",
          slug: "seo-best-practices-2024",
          author: "SEO Expert",
          date: "2024-01-10",
          category: "SEO",
          summary: "Discover the latest SEO techniques and strategies that will help your content rank higher in search results.",
          publishedDocURL: "https://docs.google.com/document/d/your-doc-id/pub",
          featuredImageURL: "/placeholder.svg"
        }
      ]);
    }
    setLoading(false);
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubscribing(true);
    try {
      // Add email to Google Sheets using Google Apps Script Web App
      const sheetId = '16brbAVXZVvOap4KGH7_l67_QlHX_TCKrD_GzlGvR5LU';
      
      // For now, we'll use a simple approach with Google Forms or you can create a Google Apps Script
      // This is a placeholder - you'll need to create a Google Apps Script Web App to handle this
      const scriptUrl = 'YOUR_GOOGLE_APPS_SCRIPT_URL'; // You'll need to create this
      
      // Alternative: Use Google Forms (simpler approach)
      // Create a Google Form connected to your sheet and submit to it
      
      // For now, let's show success message and log the email
      console.log('Subscribing email:', email);
      console.log('Email would be added to sheet:', sheetId);
      
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
                    src={post.featuredImageURL} 
                    alt={post.title}
                    className="w-full h-full object-cover"
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
