
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Services = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Our <span className="gradient-text">Services</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            Comprehensive AI-powered solutions to transform your content strategy 
            and accelerate your business growth.
          </p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            
            {/* Content Generation Service */}
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-blue text-2xl">✍️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">AI Content Generation</h3>
              <p className="text-text-secondary mb-6">
                Transform your ideas into compelling, SEO-optimized content that engages 
                your audience and drives results.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Blog posts and articles</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Social media content</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Email campaigns</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Product descriptions</span>
                </li>
              </ul>
              <Link to="/contact" className="text-accent-blue hover:text-accent-blue/80 font-medium">
                Learn More →
              </Link>
            </Card>

            {/* SEO Optimization Service */}
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-purple text-2xl">📈</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">SEO Optimization</h3>
              <p className="text-text-secondary mb-6">
                Boost your search rankings with content that's specifically optimized 
                for search engines and user engagement.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>Keyword research and optimization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>Meta tags and descriptions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>Content structure optimization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>Readability improvements</span>
                </li>
              </ul>
              <Link to="/contact" className="text-accent-purple hover:text-accent-purple/80 font-medium">
                Learn More →
              </Link>
            </Card>

            {/* Content Strategy Service */}
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-blue/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-blue text-2xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Content Strategy Consulting</h3>
              <p className="text-text-secondary mb-6">
                Work with our experts to develop a comprehensive content strategy 
                that aligns with your business goals and audience needs.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Content audit and analysis</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Editorial calendar planning</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Audience research</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Performance optimization</span>
                </li>
              </ul>
              <Link to="/contact" className="text-accent-blue hover:text-accent-blue/80 font-medium">
                Learn More →
              </Link>
            </Card>

            {/* Custom Integration Service */}
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="w-12 h-12 bg-accent-purple/20 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-accent-purple text-2xl">⚙️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Custom Integrations</h3>
              <p className="text-text-secondary mb-6">
                Seamlessly integrate our AI tools into your existing workflow 
                with custom API solutions and enterprise features.
              </p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>API development and integration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>Workflow automation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>Custom model training</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>Enterprise support</span>
                </li>
              </ul>
              <Link to="/contact" className="text-accent-purple hover:text-accent-purple/80 font-medium">
                Learn More →
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Process</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              A streamlined approach to delivering exceptional results for every client.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Discovery</h3>
              <p className="text-text-secondary">
                We understand your goals, audience, and current content challenges.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Strategy</h3>
              <p className="text-text-secondary">
                We develop a customized content strategy tailored to your needs.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Implementation</h3>
              <p className="text-text-secondary">
                We execute the strategy using our advanced AI tools and expertise.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple font-bold text-xl">4</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Optimization</h3>
              <p className="text-text-secondary">
                We continuously monitor and optimize for better results.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your <span className="gradient-text">Content Strategy</span>?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Let's discuss how our services can help you achieve your content goals.
          </p>
          <Link to="/contact" className="apple-button">
            Schedule Consultation
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
