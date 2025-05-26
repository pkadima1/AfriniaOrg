
import Layout from '../components/Layout';
import { Card } from '@/components/ui/card';

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center animate-fade-in">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            About <span className="gradient-text">Nodematics</span>
          </h1>
          <p className="text-xl text-text-secondary mb-8">
            We're on a mission to democratize high-quality content creation through 
            artificial intelligence and automation.
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="animate-slide-up">
            <h2 className="text-4xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-text-secondary mb-6">
              At Nodematics, we believe that every creator, team, and business deserves 
              access to tools that can amplify their voice and reach. Our AI-powered 
              platform removes the barriers between great ideas and great content.
            </p>
            <p className="text-lg text-text-secondary">
              We're not just building software; we're crafting the future of content 
              creation where quality, speed, and SEO optimization work in perfect harmony.
            </p>
          </div>
          <div className="lg:pl-12">
            <div className="bg-gradient-to-br from-accent-blue/10 to-accent-purple/10 rounded-3xl p-8 border border-white/10">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text">10M+</div>
                  <div className="text-text-secondary">Content Pieces Generated</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text">50K+</div>
                  <div className="text-text-secondary">Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold gradient-text">98%</div>
                  <div className="text-text-secondary">Customer Satisfaction</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Our Values</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              The principles that guide everything we do at Nodematics.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-3xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Quality First</h3>
              <p className="text-text-secondary">
                We never compromise on quality. Every feature, every update, every piece 
                of generated content meets our highest standards.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-purple/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-purple text-3xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">Innovation</h3>
              <p className="text-text-secondary">
                We're constantly pushing the boundaries of what's possible with AI 
                and automation in content creation.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-16 h-16 bg-accent-blue/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-accent-blue text-3xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-4">User-Centric</h3>
              <p className="text-text-secondary">
                Our users are at the heart of everything we do. We listen, learn, 
                and build based on real needs and feedback.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-6 lg:px-8 bg-dark-surface">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">Leadership Team</h2>
            <p className="text-xl text-text-secondary max-w-3xl mx-auto">
              Meet the visionaries behind Nodematics' innovative AI solutions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-2">Sarah Chen</h3>
              <p className="text-accent-blue mb-4">CEO & Co-Founder</p>
              <p className="text-text-secondary text-sm">
                Former AI researcher at Google with 10+ years of experience in machine learning and natural language processing.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-purple to-accent-blue rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-2">Marcus Rodriguez</h3>
              <p className="text-accent-blue mb-4">CTO & Co-Founder</p>
              <p className="text-text-secondary text-sm">
                Engineering leader with experience scaling platforms at Meta and Spotify. Expert in distributed systems and AI infrastructure.
              </p>
            </Card>

            <Card className="p-8 bg-dark-card border-white/10 text-center card-hover">
              <div className="w-24 h-24 bg-gradient-to-br from-accent-blue to-accent-purple rounded-full mx-auto mb-6"></div>
              <h3 className="text-xl font-semibold mb-2">Emily Watson</h3>
              <p className="text-accent-blue mb-4">Head of Product</p>
              <p className="text-text-secondary text-sm">
                Product strategist who led content tools at Adobe and Canva. Passionate about user experience and design thinking.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
