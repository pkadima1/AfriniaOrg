
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';

const Index = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 to-accent-purple/10"></div>
        <div className="relative max-w-7xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">AI-Powered</span><br />
            Content Generation
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-8 max-w-3xl mx-auto">
            Transform your content strategy with EngagePerfect. Generate EEAT-compliant, 
            SEO-optimized content that drives engagement and growth.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="apple-button">
              Explore EngagePerfect
            </Link>
            <Link 
              to="/contact" 
              className="px-8 py-4 border border-white/20 text-white rounded-2xl hover:bg-white/5 transition-all duration-300"
            >
              Schedule Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Why Choose <span className="gradient-text">Nodematics</span>?
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Our AI-powered solutions are designed to streamline your workflow and enhance content quality.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-scale-in">
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-blue text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">EEAT Compliance</h3>
              <p className="text-text-secondary">
                Generate content that meets Google's Experience, Expertise, Authoritativeness, 
                and Trustworthiness standards.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-purple text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">SEO Optimized</h3>
              <p className="text-text-secondary">
                Every piece of content is optimized for search engines to maximize 
                your organic reach and visibility.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-blue text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Lightning Fast</h3>
              <p className="text-text-secondary">
                Generate high-quality content in seconds, not hours. Scale your 
                content production effortlessly.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Product Spotlight */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Meet <span className="gradient-text">EngagePerfect</span>
              </h2>
              <p className="text-xl text-text-secondary mb-8">
                Our flagship platform that helps creators, teams, and small businesses 
                generate compelling content that resonates with their audience and 
                ranks well in search results.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Blog posts and articles</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Social media captions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Product descriptions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Email campaigns</span>
                </li>
              </ul>
              <Link to="/products" className="apple-button">
                Learn More
              </Link>
            </div>
            <div className="lg:pl-12">
              <div className="bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl p-8 backdrop-blur-sm border border-white/10">
                <div className="space-y-4">
                  <div className="h-4 bg-white/20 rounded-full"></div>
                  <div className="h-4 bg-white/10 rounded-full w-3/4"></div>
                  <div className="h-4 bg-white/10 rounded-full w-1/2"></div>
                  <div className="mt-6 p-4 bg-white/5 rounded-2xl">
                    <div className="text-sm text-accent-blue mb-2">Generated Content Preview</div>
                    <div className="h-3 bg-white/20 rounded-full mb-2"></div>
                    <div className="h-3 bg-white/10 rounded-full w-4/5"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your <span className="gradient-text">Content Strategy</span>?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join thousands of creators and businesses who trust Nodematics for their content needs.
          </p>
          <Link to="/contact" className="apple-button">
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
