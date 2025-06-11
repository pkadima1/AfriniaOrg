
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Products = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">EngagePerfect</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            Generate SEO content 10x faster—without sounding like a robot? But Human Like. 
            The ultimate AI-powered content generation platform that creates EEAT-compliant, 
            SEO-optimized content for creators, teams, and businesses.
          </p>
          <Link to="/contact" className="apple-button">
            Start Free Trial
          </Link>
        </div>
      </section>

      {/* Enhanced UI Preview Section */}
      <section className="py-16 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">See It in Action</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Watch EngagePerfect transform your content creation workflow with intelligent automation and human-like results
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Live Demo Interface */}
            <div className="bg-dark-card border border-white/10 rounded-3xl p-8 overflow-hidden">
              <h3 className="text-2xl font-semibold mb-6 text-center">Live Content Generator</h3>
              
              {/* Mock Interface */}
              <div className="space-y-4">
                <div className="bg-dark-bg rounded-2xl p-4 border border-accent-blue/30">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-3 h-3 bg-accent-blue rounded-full"></div>
                    <span className="text-sm font-medium">Input Prompt</span>
                  </div>
                  <p className="text-sm text-gray-300 bg-dark-surface rounded-lg p-3">
                    "Write a blog post about modern font combinations for web design"
                  </p>
                </div>
                
                <div className="text-center py-2">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent-purple/20 rounded-full">
                    <div className="w-2 h-2 bg-accent-purple rounded-full animate-pulse"></div>
                    <span className="text-sm text-accent-purple">AI Processing...</span>
                  </div>
                </div>
                
                <div className="bg-accent-blue/10 rounded-2xl p-4 border-l-4 border-accent-blue">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-accent-blue">Generated Content</h4>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded-full">SEO: 94/100</span>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    "Typography is the silent voice of your brand. When selecting font combinations for modern web design, 
                    consider pairing a clean sans-serif header like Inter with a readable body font such as Source Sans Pro..."
                  </p>
                  <div className="flex gap-2 mt-3">
                    <span className="text-xs bg-accent-blue/20 text-accent-blue px-2 py-1 rounded">1,247 words</span>
                    <span className="text-xs bg-accent-purple/20 text-accent-purple px-2 py-1 rounded">EEAT Compliant</span>
                    <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">Ready to Publish</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Features Showcase */}
            <div className="space-y-6">
              <Card className="p-6 bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 border-accent-blue/30 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-blue/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-accent-blue">Lightning Fast Generation</h3>
                    <p className="text-sm text-gray-300">Generate comprehensive blog posts, social media content, and marketing copy in seconds, not hours.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-accent-purple/10 to-accent-blue/10 border-accent-purple/30 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-purple/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-accent-purple">SEO Optimized</h3>
                    <p className="text-sm text-gray-300">Every piece of content is automatically optimized for search engines with proper keyword density and structure.</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500/10 to-accent-blue/10 border-green-500/30 card-hover">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-green-400">Human-Like Quality</h3>
                    <p className="text-sm text-gray-300">Advanced AI models ensure your content sounds natural and engaging, never robotic or generic.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-dark-card rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-accent-blue mb-2">10x</div>
              <div className="text-sm text-gray-400">Faster Content Creation</div>
            </div>
            <div className="text-center p-6 bg-dark-card rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-accent-purple mb-2">94%</div>
              <div className="text-sm text-gray-400">Average SEO Score</div>
            </div>
            <div className="text-center p-6 bg-dark-card rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-green-400 mb-2">50+</div>
              <div className="text-sm text-gray-400">Content Types</div>
            </div>
            <div className="text-center p-6 bg-dark-card rounded-2xl border border-white/10">
              <div className="text-3xl font-bold text-accent-blue mb-2">24/7</div>
              <div className="text-sm text-gray-400">AI Availability</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Powerful Features</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Everything you need to create compelling, search-optimized content at scale.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-blue text-2xl">📝</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Content Generation</h3>
              <p className="text-text-secondary mb-6">
                Generate blog posts, articles, social media captions, product descriptions, 
                and email campaigns with our advanced AI models.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>Long-form articles (1000+ words)</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>Social media content</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>Product descriptions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>Email campaigns</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-purple text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">EEAT Compliance</h3>
              <p className="text-text-secondary mb-4">
                Ensure your content meets Google's Experience, Expertise, Authoritativeness, 
                and Trustworthiness guidelines for better search rankings.
              </p>
              <p className="text-sm text-accent-purple mb-6 italic">
                e.g., adds sources & structure that Google rewards and AI search engines value
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>Expert-level content depth</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>Authoritative tone and structure</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>Trustworthy source integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>Experience-based insights</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-blue text-2xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">SEO Optimization</h3>
              <p className="text-text-secondary mb-6">
                Built-in SEO tools ensure your content ranks well in search results 
                and drives organic traffic to your website.
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>Keyword optimization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>Meta descriptions</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>Header optimization</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-blue rounded-full"></span>
                  <span>Readability scoring</span>
                </li>
              </ul>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-purple text-2xl">⚡</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Automation & Integrations</h3>
              <p className="text-text-secondary mb-4">
                Seamlessly integrate with your existing workflow and automate 
                repetitive content tasks to save time and increase productivity.
              </p>
              <p className="text-sm text-accent-purple mb-6 font-medium">
                No dev required — Sign up & start execution
              </p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>WordPress integration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>Social media scheduling</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>API access</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-accent-purple rounded-full"></span>
                  <span>Bulk content generation</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Perfect For</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              EngagePerfect adapts to your specific needs, whether you're a creator, team, or business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-3xl">👨‍💻</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Content Creators</h3>
              <p className="text-text-secondary">
                Bloggers, YouTubers, and influencers who need consistent, 
                high-quality content to engage their audience.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple text-3xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Marketing Teams</h3>
              <p className="text-text-secondary">
                Marketing departments that need to scale content production 
                while maintaining quality and brand consistency.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-3xl">🏢</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Small Businesses</h3>
              <p className="text-text-secondary">
                Small business owners who want to compete with larger companies 
                through professional, SEO-optimized content.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Enhanced Testimonials */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">What Our Clients Say</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <blockquote className="text-lg mb-6 leading-relaxed">
                "I use this daily — saves hours!"
              </blockquote>
              <div className="text-accent-blue font-medium">
                — S.P., Content Creator
              </div>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <blockquote className="text-lg mb-6 leading-relaxed">
                "NodeMatics helped us reduce content creation time by 80%. It's like having a full-time content team."
              </blockquote>
              <div className="text-accent-blue font-medium">
                — A.M., Ecommerce Founder
              </div>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <blockquote className="text-lg mb-6 leading-relaxed">
                "Their automation tools eliminated hours of manual work every week. We can finally focus on strategy."
              </blockquote>
              <div className="text-accent-blue font-medium">
                — J.K., Operations Manager
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Experience <span className="gradient-text">EngagePerfect</span>?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join thousands of creators and businesses transforming their content strategy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="apple-button">
              Start Free Trial
            </Link>
            <Link 
              to="/contact" 
              className="px-8 py-4 border border-white/20 text-white rounded-2xl hover:bg-white/5 transition-all duration-300"
            >
              Request Demo
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
