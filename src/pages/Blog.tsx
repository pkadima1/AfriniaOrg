
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, User, Tag } from 'lucide-react';
import { fetchBlogPosts, BlogPost } from '@/utils/googleSheetsApi';
import { supabase } from '@/integrations/supabase/client';

const Blog = () => {
  const { t } = useTranslation();
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
      const allPosts: BlogPost[] = [];

      // Load from Supabase
      try {
        const { data: supabasePosts, error } = await supabase
          .from('blog_posts')
          .select('*')
          .eq('status', 'published')
          .order('published_at', { ascending: false });

        if (!error && supabasePosts && supabasePosts.length > 0) {
          const convertedPosts: BlogPost[] = supabasePosts.map(post => ({
            title: post.title,
            slug: post.slug,
            author: post.author_name,
            date: post.published_at ? new Date(post.published_at).toISOString().split('T')[0] : post.created_at.split('T')[0],
            category: post.category || 'General',
            summary: post.excerpt || post.content?.substring(0, 150) + '...' || '',
            publishedDocURL: `/blog/${post.slug}`, // Use internal blog post route
            featuredImageURL: post.featured_image_url || "https://images.unsplash.com/photo-1649972904349-6e44c42644a7?w=800&h=400&fit=crop"
          }));
          allPosts.push(...convertedPosts);
        }
      } catch (supabaseError) {
        console.error('Error loading from Supabase:', supabaseError);
      }

      // Load from Google Sheets
      try {
        const blogPosts = await fetchBlogPosts();
        if (blogPosts.length > 0) {
          allPosts.push(...blogPosts);
        }
      } catch (sheetsError) {
        console.error('Error loading from Google Sheets:', sheetsError);
      }

      // Sort all posts by date (newest first) and limit to 6
      if (allPosts.length > 0) {
        const sortedPosts = allPosts
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .slice(0, 6);
        setPosts(sortedPosts);
      } else {
        // Fallback sample data only if no posts from either source
        setPosts([
          {
            title: "Getting Started with AI Content Creation",
            slug: "getting-started-ai-content",
            author: "InSighter Team",
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
      // Send to Google Apps Script Web App
      const response = await fetch('https://script.google.com/macros/s/AKfycbwBrO-MXdOI68Ae0ATLwTN6IcicLn5QXpMou1faaL8BRjd4fpzvpmkafHRcjZh6oEF7/exec', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'newsletter_subscription',
          email: email,
          subscribed_at: new Date().toISOString()
        }),
      });

      console.log('Newsletter subscription sent to Google Apps Script');
      
      setSubscribeMessage(t('blog.newsletter.success'));
      setEmail('');
      setTimeout(() => setSubscribeMessage(''), 5000);
      
    } catch (error) {
      console.error('Error subscribing:', error);
      setSubscribeMessage(t('blog.newsletter.error'));
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
          <h1 className="text-4xl font-bold mb-4 gradient-text">{t('blog.title')}</h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            {t('blog.subtitle')}
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
                    {t('blog.readMore')}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Newsletter Subscription */}
        <Card className="glass-effect max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl mb-2">{t('blog.newsletter.title')}</CardTitle>
            <p className="text-gray-400">
              {t('blog.newsletter.subtitle')}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubscribe} className="flex gap-4">
              <Input
                type="email"
                placeholder={t('blog.newsletter.placeholder')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                disabled={subscribing}
              />
              <Button type="submit" className="apple-button" disabled={subscribing}>
                {subscribing ? t('blog.newsletter.subscribing') : t('blog.newsletter.button')}
              </Button>
            </form>
            {subscribeMessage && (
              <p className="text-center mt-4 text-accent-blue">{subscribeMessage}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Blog;
