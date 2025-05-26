
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';

const Pricing = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            Choose the perfect plan for your content needs. Upgrade or downgrade at any time.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Starter Plan */}
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-4">Starter</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$29</span>
                  <span className="text-text-secondary">/month</span>
                </div>
                <p className="text-text-secondary mb-8">
                  Perfect for individual creators and small projects.
                </p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>50 content pieces per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Basic SEO optimization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Email support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Standard templates</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Export to common formats</span>
                </li>
              </ul>
              
              <Link 
                to="/contact" 
                className="w-full block text-center px-6 py-3 border border-accent-blue text-accent-blue rounded-xl hover:bg-accent-blue hover:text-white transition-all duration-300"
              >
                Get Started
              </Link>
            </Card>

            {/* Professional Plan - Most Popular */}
            <Card className="p-8 bg-dark-card border-accent-blue card-hover relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-accent-blue text-white px-4 py-2 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-4">Professional</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">$79</span>
                  <span className="text-text-secondary">/month</span>
                </div>
                <p className="text-text-secondary mb-8">
                  Ideal for growing businesses and marketing teams.
                </p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>200 content pieces per month</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Advanced SEO optimization</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Priority support</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Custom templates</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>API access</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Analytics dashboard</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span>Team collaboration</span>
                </li>
              </ul>
              
              <Link 
                to="/contact" 
                className="apple-button w-full text-center"
              >
                Start Free Trial
              </Link>
            </Card>

            {/* Enterprise Plan */}
            <Card className="p-8 bg-dark-card border-white/10 card-hover">
              <div className="text-center">
                <h3 className="text-2xl font-semibold mb-4">Enterprise</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold">Custom</span>
                </div>
                <p className="text-text-secondary mb-8">
                  Tailored solutions for large organizations.
                </p>
              </div>
              
              <ul className="space-y-4 mb-8">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>Unlimited content generation</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>Custom AI model training</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>Dedicated account manager</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>White-label options</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>SLA guarantee</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span>Advanced security</span>
                </li>
              </ul>
              
              <Link 
                to="/contact" 
                className="w-full block text-center px-6 py-3 border border-accent-purple text-accent-purple rounded-xl hover:bg-accent-purple hover:text-white transition-all duration-300"
              >
                Contact Sales
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Frequently Asked Questions</h2>
            <p className="text-xl text-text-secondary">
              Everything you need to know about our pricing and plans.
            </p>
          </div>

          <div className="space-y-8">
            <Card className="p-6 bg-dark-card border-white/10">
              <h3 className="text-xl font-semibold mb-3">Can I change my plan at any time?</h3>
              <p className="text-text-secondary">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect 
                immediately, and we'll prorate any billing differences.
              </p>
            </Card>

            <Card className="p-6 bg-dark-card border-white/10">
              <h3 className="text-xl font-semibold mb-3">Is there a free trial available?</h3>
              <p className="text-text-secondary">
                We offer a 14-day free trial for the Professional plan, which includes 
                access to all features with no credit card required.
              </p>
            </Card>

            <Card className="p-6 bg-dark-card border-white/10">
              <h3 className="text-xl font-semibold mb-3">What happens if I exceed my content limit?</h3>
              <p className="text-text-secondary">
                You can purchase additional content credits at $0.50 per piece, or upgrade 
                to a higher plan for better value.
              </p>
            </Card>

            <Card className="p-6 bg-dark-card border-white/10">
              <h3 className="text-xl font-semibold mb-3">Do you offer annual discounts?</h3>
              <p className="text-text-secondary">
                Yes! Annual plans receive a 20% discount. Contact our sales team for 
                enterprise annual pricing options.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Get <span className="gradient-text">Started</span>?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Choose your plan and start creating amazing content today.
          </p>
          <Link to="/contact" className="apple-button">
            Start Your Free Trial
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Pricing;
