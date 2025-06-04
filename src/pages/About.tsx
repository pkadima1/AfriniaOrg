
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="gradient-text">NodeMatics</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8 leading-relaxed">
            NodeMatics helps solopreneurs, small teams with ambitions work smarter by building 
            lean automation tools and solutions, that save time, reduce repetitive work, and drive growth. 
            We focus on practicality over complexity—using AI and automation to simplify everyday business challenges.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h2 className="text-4xl font-bold mb-6">Who We Are</h2>
            <p className="text-lg text-text-secondary mb-6 leading-relaxed">
              Founded in 2017, NodeMatics started as a hands-on consulting service and has grown 
              into a product-first digital firm. Today, we develop scalable tools like EngagePerfect 
              and SkySpark rule packages that serve creators, consultants, and small businesses around the world.
            </p>
            <p className="text-lg text-text-secondary leading-relaxed">
              We are a growing team of developers, consultants, and creators who believe in one thing 
              above all: your time is too valuable to be wasted on tasks that can be automated and improved.
            </p>
          </div>
          <div className="lg:pl-12">
            <div className="bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 rounded-3xl p-8 border border-white/10">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text">7+</div>
                  <div className="text-text-secondary">Years of Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text">500+</div>
                  <div className="text-text-secondary">Projects Delivered</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text">15+</div>
                  <div className="text-text-secondary">Countries Served</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">What We Believe</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-3xl">⏰</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Time is your most valuable asset</h3>
              <p className="text-text-secondary">
                Our tools are designed to give you more of it
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Simplicity scales</h3>
              <p className="text-text-secondary">
                We don't overbuild. We design lean, practical solutions
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-3xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Improvement is constant</h3>
              <p className="text-text-secondary">
                We believe small, smart changes create lasting growth
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Founders Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Meet the Founders</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-4xl mx-auto">
            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
                <img 
                  src="/lovable-uploads/f77d9966-f5a3-4c77-bb28-46fb6285448b.png" 
                  alt="Patrick Kadima" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Patrick Kadima</h3>
              <p className="text-accent-blue mb-4 font-medium">Co-Founder & Automation Lead</p>
              <p className="text-text-secondary leading-relaxed">
                Automation & AI Consultant with 10+ years' experience helping businesses across 
                Europe and Africa streamline operations. Creator of EngagePerfect. Passionate 
                about process design and digital growth.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden">
                <img 
                  src="/lovable-uploads/1fb7ed00-84e5-45f2-b0f7-f978ebd3578b.png" 
                  alt="Sunita" 
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-2xl font-semibold mb-2">Sunita</h3>
              <p className="text-accent-blue mb-4 font-medium">Co-Founder & Creative Lead</p>
              <p className="text-text-secondary leading-relaxed">
                Creative strategist and project lead. Co-founder of CurioKids and advocate for 
                education, storytelling, and accessible tech tools.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            Want to See <span className="gradient-text">What's Possible?</span>
          </h2>
          <p className="text-xl text-text-secondary mb-12 leading-relaxed">
            Let's talk about how automation can free up your time, improve your processes, 
            and grow your business. The first hour is on us.
          </p>
          <a 
            href="#contact" 
            className="apple-button bg-gradient-to-r from-accent-blue to-accent-purple hover:from-accent-blue/90 hover:to-accent-purple/90"
          >
            Book Your Free Consultation
          </a>
        </div>
      </section>
    </Layout>
  );
};

export default About;
