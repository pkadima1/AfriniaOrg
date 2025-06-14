import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { useEffect } from 'react';

const Index = () => {
  useEffect(() => {
    // Load Google Calendar scheduling script
    const link = document.createElement('link');
    link.href = 'https://calendar.google.com/calendar/scheduling-button-script.css';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = 'https://calendar.google.com/calendar/scheduling-button-script.js';
    script.async = true;
    document.head.appendChild(script);

    // Cleanup function
    return () => {
      document.head.removeChild(link);
      document.head.removeChild(script);
    };
  }, []);

  const handleCalendarClick = () => {
    // @ts-ignore - Google Calendar API
    if (window.calendar?.schedulingButton) {
      // @ts-ignore
      window.calendar.schedulingButton.load({
        url: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true',
        color: '#039BE5',
        label: "Book Free Strategy Call"
      });
    } else {
      // Fallback to direct link if script not loaded
      window.open('https://calendar.google.com/calendar/appointments/schedules/AcZssZ0jPSL5lWFs921ITjSqM9lccdsQD0vDmFDY_RErbgAbwLn9gZF4JaB5EMCpN05tR_rebTIPw4EV?gv=true', '_blank');
    }
  };

  const solutions = [
    {
      title: "EngagePerfect",
      description: "AI-powered content generation for blogs, captions, and product copy",
      icon: "🎯"
    },
    {
      title: "SkySpark Rules",
      description: "Custom SkySpark analytics and Axon scripts for building/facility optimization",
      icon: "⚡"
    },
    {
      title: "Smart Automations",
      description: "Small, remote-first tools that eliminate bottlenecks and save time",
      icon: "🤖"
    }
  ];

  const coreValues = [
    {
      title: "We Respect Your Time",
      description: "Tools built to free you from repetitive work",
      icon: "⏰"
    },
    {
      title: "We Keep It Practical",
      description: "Simple, lean, and scalable—not overbuilt or bloated",
      icon: "🎯"
    },
    {
      title: "We Build for Impact",
      description: "Everything we do supports measurable growth",
      icon: "📈"
    }
  ];

  const clientLogos = [
    { name: "CoffeeDesk", image: "/lovable-uploads/df1e608e-1eaf-400e-a5ff-dcc7b1c2e147.png" },
    { name: "Biscuiteers", image: "/lovable-uploads/151297f0-c6b5-40a4-8af9-3eee4de77ffc.png" },
    { name: "WebInsight", image: "/lovable-uploads/75a928ad-e768-4ae4-befd-90a07fca9f8a.png" },
    { name: "WikiLaps", image: "/lovable-uploads/b3cdf068-a2d8-4b73-bc82-2e33138ede1f.png" }
  ];

  const testimonials = [
    {
      quote: "NodeMatics helped us reduce content creation time by 80%. It's like having a full-time content team.",
      author: "A.M., Ecommerce Founder"
    },
    {
      quote: "Their automation tools eliminated hours of manual work every week. We can finally focus on strategy.",
      author: "J.K., Operations Manager"
    },
    {
      quote: "The SkySpark implementation optimized our facility management beyond our expectations.",
      author: "R.L., Facility Director"
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/5 to-accent-purple/5"></div>
        <div className="relative max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-6xl md:text-8xl font-bold mb-8">
            Work Less. <span className="gradient-text">Grow More.</span>
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto leading-relaxed">
            NodeMatics helps small teams and creators automate content, operations, and analytics—so they can focus on what really matters.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              to="/products" 
              className="apple-button bg-accent-purple hover:bg-accent-purple/90 hover:shadow-accent-purple/20"
            >
              Explore EngagePerfect
            </Link>
            <Link 
              to="/about" 
              className="apple-button bg-accent-blue hover:bg-accent-blue/90 hover:shadow-accent-blue/20"
            >
              Learn About Us
            </Link>
            <button 
              onClick={handleCalendarClick}
              className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90"
            >
              Book Free Strategy Call
            </button>
          </div>
        </div>
      </section>

      {/* Our Solutions */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Smart Tools for <span className="gradient-text">Real Results</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-scale-in">
            {solutions.map((solution, index) => (
              <Card key={index} className="p-8 bg-dark-card border-white/10 card-hover text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-4xl">{solution.icon}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{solution.title}</h3>
                <p className="text-text-secondary leading-relaxed">
                  {solution.description}
                </p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              Why We <span className="gradient-text">Exist</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-scale-in">
            {coreValues.map((value, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-accent-blue/20 to-accent-purple/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                  <span className="text-3xl">{value.icon}</span>
                </div>
                <h3 className="text-2xl font-bold mb-4">{value.title}</h3>
                <p className="text-text-secondary leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Logo Bar */}
      <section className="py-16 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-2">
              Trusted by Teams <span className="gradient-text">Like...</span>
            </h2>
          </div>
          
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-12">
            {clientLogos.map((logo, index) => (
              <div key={index} className="flex items-center justify-center h-16 opacity-70 hover:opacity-100 transition-opacity">
                <img 
                  src={logo.image} 
                  alt={logo.name} 
                  className="max-h-full max-w-32 object-contain filter grayscale hover:grayscale-0 transition-all"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Client Testimonials */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              What Our <span className="gradient-text">Clients Say</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="p-8 bg-dark-card border-white/10 text-center">
                <blockquote className="text-lg mb-6 leading-relaxed">
                  "{testimonial.quote}"
                </blockquote>
                <div className="text-accent-blue font-medium">
                  — {testimonial.author}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Let's Build <span className="gradient-text">Smarter, Together</span>
          </h2>
          <p className="text-xl text-text-secondary mb-12 leading-relaxed">
            Want to explore what's possible in just one hour? Book a free call—we'll map out ways to save time, automate tasks, and grow your business.
          </p>
          <button 
            onClick={handleCalendarClick}
            className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90"
          >
            Book Your Free Strategy Call
          </button>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
