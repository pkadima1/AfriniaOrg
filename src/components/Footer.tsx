
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-dark-surface border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="text-2xl font-bold gradient-text">
              Nodematics
            </Link>
            <p className="mt-4 text-text-secondary max-w-md">
              Empowering creators, teams, and businesses with AI-powered automation tools 
              and content generation solutions.
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-text-secondary hover:text-white transition-colors">About</Link></li>
              <li><Link to="/services" className="text-text-secondary hover:text-white transition-colors">Services</Link></li>
              <li><Link to="/pricing" className="text-text-secondary hover:text-white transition-colors">Pricing</Link></li>
              <li><Link to="/contact" className="text-text-secondary hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-white mb-4">Products</h3>
            <ul className="space-y-2">
              <li><Link to="/products" className="text-text-secondary hover:text-white transition-colors">EngagePerfect</Link></li>
              <li><a href="#" className="text-text-secondary hover:text-white transition-colors">API Access</a></li>
              <li><a href="#" className="text-text-secondary hover:text-white transition-colors">Integrations</a></li>
              <li><a href="#" className="text-text-secondary hover:text-white transition-colors">Support</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 mt-12 pt-8 text-center text-text-secondary">
          <p>&copy; 2024 Nodematics. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
