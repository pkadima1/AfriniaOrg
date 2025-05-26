
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Solutions = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Complete <span className="gradient-text">Solutions</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            From industrial automation to content creation, we provide comprehensive 
            solutions that drive real business transformation.
          </p>
        </div>
      </section>

      {/* Section 1: Industrial Efficiency & Analytics */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Industrial Efficiency & <span className="gradient-text">Analytics</span>
            </h2>
            <p className="text-2xl text-text-secondary max-w-3xl mx-auto">
              Real-time insights. Measurable results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <Card className="p-8 bg-dark-card border-white/10 card-hover text-center">
              <div className="w-20 h-20 bg-accent-blue/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-4xl">⚡</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Energy Audits</h3>
              <p className="text-text-secondary leading-relaxed">
                Comprehensive energy monitoring and optimization to reduce costs 
                and improve efficiency across all facilities.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover text-center">
              <div className="w-20 h-20 bg-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple text-4xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">KPI Tracking</h3>
              <p className="text-text-secondary leading-relaxed">
                Real-time dashboard tracking of key performance indicators 
                with customizable alerts and reporting.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover text-center">
              <div className="w-20 h-20 bg-accent-blue/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-4xl">🔧</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Equipment Fault Detection</h3>
              <p className="text-text-secondary leading-relaxed">
                Predictive maintenance algorithms that detect equipment 
                issues before they cause downtime.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover text-center">
              <div className="w-20 h-20 bg-accent-purple/20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple text-4xl">☁️</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Cloud-Based Dashboards</h3>
              <p className="text-text-secondary leading-relaxed">
                Secure, scalable cloud infrastructure with intuitive 
                dashboards accessible anywhere, anytime.
              </p>
            </Card>
          </div>

          <div className="text-center">
            <Link 
              to="/services" 
              className="inline-flex items-center px-10 py-5 bg-accent-blue hover:bg-accent-blue/90 text-white text-lg rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-blue/20"
            >
              Explore Industrial Solutions
              <span className="ml-3">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Section 2: EngagePerfect */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="gradient-text">EngagePerfect</span>
            </h2>
            <p className="text-2xl text-text-secondary max-w-3xl mx-auto">
              Smarter content. Human results.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <Card className="p-10 bg-gradient-to-br from-accent-purple/20 to-accent-purple/5 border-accent-purple/20 card-hover">
              <div className="w-20 h-20 bg-accent-purple/30 rounded-3xl flex items-center justify-center mb-8">
                <span className="text-accent-purple text-4xl">✍️</span>
              </div>
              <h3 className="text-2xl font-semibold mb-6">AI-Powered Caption Generator</h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                Generate engaging, on-brand captions for social media platforms 
                that drive engagement and maintain consistent voice across all channels.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Platform-specific optimization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Hashtag recommendations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Tone and style customization</span>
                </li>
              </ul>
            </Card>

            <Card className="p-10 bg-gradient-to-br from-accent-blue/20 to-accent-blue/5 border-accent-blue/20 card-hover">
              <div className="w-20 h-20 bg-accent-blue/30 rounded-3xl flex items-center justify-center mb-8">
                <span className="text-accent-blue text-4xl">📝</span>
              </div>
              <h3 className="text-2xl font-semibold mb-6">SEO-Optimized Blog Generator</h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                Create comprehensive, search-engine optimized blog posts that 
                rank well and provide real value to your audience.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span className="text-sm">Keyword research integration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span className="text-sm">Meta description generation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span className="text-sm">Long-form content structure</span>
                </li>
              </ul>
            </Card>

            <Card className="p-10 bg-gradient-to-br from-accent-purple/20 to-accent-blue/5 border-gradient-to-r border-accent-purple/20 card-hover">
              <div className="w-20 h-20 bg-gradient-to-br from-accent-purple/30 to-accent-blue/30 rounded-3xl flex items-center justify-center mb-8">
                <span className="text-white text-4xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold mb-6">EEAT Compliance for Marketing</h3>
              <p className="text-text-secondary leading-relaxed mb-6">
                Ensure all content meets Google's Experience, Expertise, 
                Authoritativeness, and Trustworthiness guidelines.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Expert-level content depth</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span className="text-sm">Authority building strategies</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Trust signal optimization</span>
                </li>
              </ul>
            </Card>
          </div>

          <div className="text-center">
            <Link 
              to="/products" 
              className="inline-flex items-center px-10 py-5 bg-accent-purple hover:bg-accent-purple/90 text-white text-lg rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/20"
            >
              See it in Action
              <span className="ml-3">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Integration Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Integrate Both <span className="gradient-text">Solutions</span>?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Combine industrial automation with content intelligence for complete 
            digital transformation across your organization.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="apple-button">
              Schedule Consultation
            </Link>
            <Link 
              to="/pricing" 
              className="px-8 py-4 border border-white/20 text-white rounded-2xl hover:bg-white/5 transition-all duration-300"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Solutions;
