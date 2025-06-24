import { useLocation } from "wouter";
import { Mail, Phone, MapPin, Linkedin, Twitter, Facebook } from "lucide-react";

export const Footer = () => {
  const [, setLocation] = useLocation();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigation = (path: string) => {
    if (path.startsWith('#')) {
      scrollToSection(path.substring(1));
    } else {
      setLocation(path);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-loansphere-green to-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LS</span>
              </div>
              <span className="text-xl font-bold text-loansphere-green">LoanSphere</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Zambia's premier loan marketplace connecting borrowers with verified lenders. 
              Building a transparent and accessible financial ecosystem for everyone.
            </p>
            <div className="flex space-x-4">
              <button className="text-gray-400 hover:text-loansphere-green transition-colors">
                <Facebook className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-loansphere-green transition-colors">
                <Twitter className="h-5 w-5" />
              </button>
              <button className="text-gray-400 hover:text-loansphere-green transition-colors">
                <Linkedin className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Products */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Products</h3>
            <div className="space-y-2">
              <button 
                onClick={() => handleNavigation('/loans')}
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Find Loans
              </button>
              <button 
                onClick={() => handleNavigation('#features')}
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Lender Platform
              </button>
              <button 
                onClick={() => handleNavigation('#features')}
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Investment Tools
              </button>
              <button 
                onClick={() => handleNavigation('#features')}
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Credit Scoring
              </button>
              <button 
                onClick={() => handleNavigation('#pricing')}
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                API Access
              </button>
            </div>
          </div>

          {/* Company */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Company</h3>
            <div className="space-y-2">
              <button 
                onClick={() => handleNavigation('#about')}
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                About Us
              </button>
              <button 
                onClick={() => handleNavigation('#features')}
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                How It Works
              </button>
              <button 
                onClick={() => handleNavigation('#pricing')}
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Pricing
              </button>
              <button 
                onClick={() => handleNavigation('#contact')}
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Contact
              </button>
              <button 
                onClick={() => handleNavigation('#careers')}
                className="block text-gray-400 hover:text-white transition-colors text-sm"
              >
                Careers
              </button>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-4 w-4 text-loansphere-green" />
                <span className="text-gray-400 text-sm">
                  Lusaka, Zambia
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-loansphere-green" />
                <span className="text-gray-400 text-sm">
                  +260 973 588 838
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-loansphere-green" />
                <span className="text-gray-400 text-sm">
                  info@loansphere.world
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 LoanSphere. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <button 
                onClick={() => handleNavigation('#privacy')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => handleNavigation('#terms')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => handleNavigation('#compliance')}
                className="text-gray-400 hover:text-white transition-colors text-sm"
              >
                Compliance
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};