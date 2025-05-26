
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

const IndustrialAnalytics = () => {
  const [savingsCount, setSavingsCount] = useState(0);
  const [uptimeCount, setUptimeCount] = useState(0);
  const [alertsCount, setAlertsCount] = useState(0);

  useEffect(() => {
    // Animate savings counter
    const savingsTimer = setInterval(() => {
      setSavingsCount(prev => prev < 47200 ? prev + 1000 : 47200);
    }, 50);

    // Animate uptime counter
    const uptimeTimer = setInterval(() => {
      setUptimeCount(prev => prev < 99.7 ? prev + 0.1 : 99.7);
    }, 30);

    // Animate alerts counter
    const alertsTimer = setInterval(() => {
      setAlertsCount(prev => prev < 24 ? prev + 1 : 24);
    }, 100);

    return () => {
      clearInterval(savingsTimer);
      clearInterval(uptimeTimer);
      clearInterval(alertsTimer);
    };
  }, []);

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Optimize Your <span className="gradient-text">Operations</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            Turn operational data into competitive advantage with real-time insights, 
            predictive analytics, and intelligent automation.
          </p>
          <Link to="/contact" className="apple-button">
            Start Your Optimization
          </Link>
        </div>
      </section>

      {/* Animated Metrics */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-4">
                €{savingsCount.toLocaleString()}
              </div>
              <p className="text-text-secondary">Saved in 2024</p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="text-4xl md:text-5xl font-bold text-accent-blue mb-4">
                {uptimeCount.toFixed(1)}%
              </div>
              <p className="text-text-secondary">Equipment Uptime</p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="text-4xl md:text-5xl font-bold text-accent-purple mb-4">
                {alertsCount}/7
              </div>
              <p className="text-text-secondary">Predictive Alerts</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Complete Analytics Suite</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Everything you need to monitor, analyze, and optimize your industrial operations.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Card className="p-10 bg-dark-card border-white/10 card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-3xl flex items-center justify-center mb-8">
                <span className="text-accent-blue text-4xl">⚡</span>
              </div>
              <h3 className="text-2xl font-semibold mb-6">Energy Audits</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Comprehensive energy consumption analysis that identifies inefficiencies, 
                tracks usage patterns, and provides actionable recommendations for optimization.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span className="text-sm">Real-time consumption monitoring</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span className="text-sm">Peak demand analysis</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span className="text-sm">Cost optimization reports</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span className="text-sm">Carbon footprint tracking</span>
                </li>
              </ul>
            </Card>

            <Card className="p-10 bg-dark-card border-white/10 card-hover">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-3xl flex items-center justify-center mb-8">
                <span className="text-accent-purple text-4xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold mb-6">Real-time Monitoring</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Live operational insights with instant visibility into all critical systems, 
                enabling immediate response to changes and anomalies.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Equipment status monitoring</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Performance metrics tracking</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Temperature and humidity sensors</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Production line visibility</span>
                </li>
              </ul>
            </Card>

            <Card className="p-10 bg-dark-card border-white/10 card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-3xl flex items-center justify-center mb-8">
                <span className="text-accent-blue text-4xl">📈</span>
              </div>
              <h3 className="text-2xl font-semibold mb-6">KPI Dashboards</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Customizable dashboards that transform complex data into clear, 
                actionable insights for informed decision-making at every level.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span className="text-sm">Custom KPI configuration</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span className="text-sm">Role-based access control</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span className="text-sm">Mobile-responsive design</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-blue rounded-full"></span>
                  <span className="text-sm">Automated reporting</span>
                </li>
              </ul>
            </Card>

            <Card className="p-10 bg-dark-card border-white/10 card-hover">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-3xl flex items-center justify-center mb-8">
                <span className="text-accent-purple text-4xl">🔔</span>
              </div>
              <h3 className="text-2xl font-semibold mb-6">Predictive Alerts</h3>
              <p className="text-text-secondary mb-6 leading-relaxed">
                Advanced AI algorithms that predict equipment failures and operational issues 
                before they occur, minimizing downtime and maintenance costs.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Machine learning predictions</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Maintenance scheduling</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Multi-channel notifications</span>
                </li>
                <li className="flex items-center space-x-3">
                  <span className="w-2 h-2 bg-accent-purple rounded-full"></span>
                  <span className="text-sm">Historical trend analysis</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Why Choose Our Analytics?</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Transform your operations with proven technology and measurable results.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Immediate ROI</h3>
              <p className="text-text-secondary">
                See measurable cost savings and efficiency improvements 
                within the first month of implementation.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple text-3xl">🔧</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Easy Integration</h3>
              <p className="text-text-secondary">
                Seamlessly connects with existing systems and equipment 
                without disrupting current operations.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-3xl">📞</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Expert Support</h3>
              <p className="text-text-secondary">
                Dedicated support team and ongoing optimization 
                to ensure maximum value from your investment.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to <span className="gradient-text">Optimize</span> Your Operations?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join leading manufacturers who trust our analytics platform to drive efficiency and reduce costs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="apple-button">
              Schedule Demo
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

export default IndustrialAnalytics;
