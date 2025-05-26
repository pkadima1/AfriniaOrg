
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

const Index = () => {
  const testimonials = [
    {
      quote: "Nodematics transformed our manufacturing efficiency by 40%. Their industrial solutions are game-changing.",
      author: "Sarah Chen",
      title: "Operations Director",
      company: "TechManufacturing Inc."
    },
    {
      quote: "EngagePerfect helped us scale our content creation while maintaining quality. Our engagement rates doubled.",
      author: "Marcus Rodriguez",
      title: "Marketing Manager",
      company: "GrowthCorp"
    },
    {
      quote: "The data insights from Nodematics helped us make decisions that saved millions in operational costs.",
      author: "Jennifer Walsh",
      title: "Plant Manager",
      company: "Industrial Solutions Ltd."
    }
  ];

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-20 px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-blue/10 to-accent-purple/10"></div>
        <div className="relative max-w-7xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="gradient-text">Digital Transformation</span><br />
            for the Real World
          </h1>
          <p className="text-xl md:text-2xl text-text-secondary mb-8 max-w-4xl mx-auto">
            From factory floor to social media feed — Nodematics turns data into decisions.
          </p>
        </div>
      </section>

      {/* Dual Focus Feature Cards */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Energy & Facility Intelligence Card */}
            <Card className="p-12 bg-gradient-to-br from-accent-blue/20 to-accent-blue/5 border-accent-blue/20 card-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-blue/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-accent-blue/20 rounded-3xl flex items-center justify-center mb-8">
                  <span className="text-accent-blue text-3xl">⚡</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Energy & Facility <span className="gradient-text">Intelligence</span>
                </h2>
                <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                  Transform your industrial operations with real-time monitoring, 
                  predictive analytics, and intelligent automation that drives efficiency 
                  and reduces costs.
                </p>
                <Link 
                  to="/services" 
                  className="inline-flex items-center px-8 py-4 bg-accent-blue hover:bg-accent-blue/90 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-blue/20"
                >
                  Explore Industrial Solutions
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </Card>

            {/* AI-Powered Content Card */}
            <Card className="p-12 bg-gradient-to-br from-accent-purple/20 to-accent-purple/5 border-accent-purple/20 card-hover relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/10 rounded-full -translate-y-16 translate-x-16"></div>
              <div className="relative z-10">
                <div className="w-16 h-16 bg-accent-purple/20 rounded-3xl flex items-center justify-center mb-8">
                  <span className="text-accent-purple text-3xl">🎯</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  AI-Powered Content <span className="gradient-text">EngagePerfect</span>
                </h2>
                <p className="text-xl text-text-secondary mb-8 leading-relaxed">
                  Generate EEAT-compliant, SEO-optimized content that drives engagement. 
                  Perfect for creators, teams, and businesses scaling their content strategy.
                </p>
                <Link 
                  to="/products" 
                  className="inline-flex items-center px-8 py-4 bg-accent-purple hover:bg-accent-purple/90 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-accent-purple/20"
                >
                  Explore EngagePerfect
                  <span className="ml-2">→</span>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Value Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Our <span className="gradient-text">Core Values</span>
            </h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Three principles that guide everything we do at Nodematics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-scale-in">
            <Card className="p-8 bg-dark-card border-white/10 card-hover text-center">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-accent-blue text-3xl">📊</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Data-Driven</h3>
              <p className="text-text-secondary leading-relaxed">
                Every decision backed by real insights. We turn complex data into 
                clear, actionable intelligence that drives measurable results.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover text-center">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-accent-purple text-3xl">🎯</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Results-Focused</h3>
              <p className="text-text-secondary leading-relaxed">
                We don't just deliver technology — we deliver outcomes. Our solutions 
                are designed to generate real business value from day one.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 card-hover text-center">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-3xl flex items-center justify-center mb-6 mx-auto">
                <span className="text-accent-blue text-3xl">🤝</span>
              </div>
              <h3 className="text-2xl font-semibold mb-4">Human-Centered Automation</h3>
              <p className="text-text-secondary leading-relaxed">
                Technology should empower people, not replace them. Our automation 
                solutions enhance human capability and decision-making.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonial Carousel */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              What Our <span className="gradient-text">Clients Say</span>
            </h2>
            <p className="text-xl text-text-secondary">
              Real results from real businesses transforming with Nodematics.
            </p>
          </div>

          <Carousel className="w-full">
            <CarouselContent>
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index}>
                  <Card className="p-12 bg-dark-card border-white/10 text-center">
                    <blockquote className="text-2xl md:text-3xl font-light mb-8 leading-relaxed">
                      "{testimonial.quote}"
                    </blockquote>
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full flex items-center justify-center mb-4">
                        <span className="text-white font-bold text-xl">
                          {testimonial.author.split(' ').map(name => name[0]).join('')}
                        </span>
                      </div>
                      <div className="text-lg font-semibold">{testimonial.author}</div>
                      <div className="text-text-secondary">{testimonial.title}</div>
                      <div className="text-accent-blue font-medium">{testimonial.company}</div>
                    </div>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="bg-dark-card border-white/20 text-white hover:bg-white/10" />
            <CarouselNext className="bg-dark-card border-white/20 text-white hover:bg-white/10" />
          </Carousel>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Transform Your <span className="gradient-text">Business</span>?
          </h2>
          <p className="text-xl text-text-secondary mb-8">
            Join hundreds of companies who trust Nodematics for their digital transformation.
          </p>
          <Link to="/contact" className="apple-button">
            Start Your Journey Today
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
