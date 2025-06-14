
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';

const Services = () => {
  const [isCalendarReady, setIsCalendarReady] = useState(false);
  const calendarTargetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Google Calendar scheduling script
    const link = document.createElement('link');
    link.href = 'https://calendar.google.com/calendar/scheduling-button-script.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://calendar.google.com/calendar/scheduling-button-script.js';
    script.async = true;
    
    script.onload = () => {
      console.log('Google Calendar script loaded');
      setTimeout(() => {
        setIsCalendarReady(true);
        console.log('Calendar ready state set');
      }, 1000);
    };

    script.onerror = () => {
      console.error('Failed to load Google Calendar script');
    };

    document.head.appendChild(script);

    return () => {
      try {
        document.head.removeChild(link);
        document.head.removeChild(script);
      } catch (e) {
        console.log('Cleanup error (expected):', e);
      }
    };
  }, []);

  const handleCalendarClick = () => {
    console.log('Calendar button clicked');
    console.log('Calendar ready:', isCalendarReady);
    console.log('Calendar target ref:', calendarTargetRef.current);

    try {
      if ((window as any).calendar && (window as any).calendar.schedulingButton && calendarTargetRef.current) {
        console.log('Using calendar widget with target element');
        (window as any).calendar.schedulingButton.load({
          url: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
          color: '#039BE5',
          label: "Book Free Strategy Call",
          target: calendarTargetRef.current
        });

        // Wait for the Google button to be created, then auto-click it
        setTimeout(() => {
          const googleButton = calendarTargetRef.current?.querySelector('button');
          if (googleButton) {
            console.log('Auto-clicking Google calendar button');
            googleButton.click();
          } else {
            console.log('Google button not found, trying iframe approach');
            const iframe = calendarTargetRef.current?.querySelector('iframe');
            if (iframe) {
              console.log('Calendar iframe found');
            } else {
              console.log('Fallback to direct link');
              window.open('https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true', '_blank');
            }
          }
        }, 500);
      } else {
        console.log('Fallback to direct link');
        window.open('https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true', '_blank');
      }
    } catch (error) {
      console.error('Calendar error:', error);
      window.open('https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true', '_blank');
    }
  };

  return (
    <Layout>
      {/* Calendar widget target - make it visible but positioned off-screen for auto-click */}
      <div ref={calendarTargetRef} className="fixed -top-96 left-0 opacity-0 pointer-events-none"></div>
      
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
          <button 
            onClick={handleCalendarClick}
            className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90"
          >
            Schedule Consultation
          </button>
        </div>
      </section>
    </Layout>
  );
};

export default Services;
