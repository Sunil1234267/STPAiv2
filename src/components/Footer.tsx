import React from 'react'
import { Link } from 'react-router-dom'
import { Facebook, Instagram, Twitter, UserCog } from 'lucide-react'
import { Session } from '@supabase/supabase-js'

interface FooterProps {
  session: Session | null
  userRole: string | null
}

const Footer: React.FC<FooterProps> = ({ session, userRole }) => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 px-4 sm:px-8 border-t border-gray-800">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Textile Design Studio</h3>
          <p className="text-xs sm:text-sm leading-relaxed">
            A premium textile design studio for all your custom fabric needs.
          </p>
          <div className="flex justify-center md:justify-start space-x-4 mt-3 sm:mt-4">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Facebook size={18} sm:size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Instagram size={18} sm:size={20} />
            </a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">
              <Twitter size={18} sm:size={20} />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Quick Links</h3>
          <ul className="space-y-1 sm:space-y-2">
            <li><Link to="/" className="hover:text-white transition-colors text-xs sm:text-sm">Home</Link></li>
            <li><Link to="/designs" className="hover:text-white transition-colors text-xs sm:text-sm">Designs</Link></li>
            <li><Link to="/pricing" className="hover:text-white transition-colors text-xs sm:text-sm">Pricing</Link></li>
            <li><Link to="/about" className="hover:text-white transition-colors text-xs sm:text-sm">About</Link></li> {/* Added About link */}
            <li><Link to="/contact" className="hover:text-white transition-colors text-xs sm:text-sm">Contact</Link></li>
            {userRole === 'admin' && (
              <li>
                <Link to="/admin" className="hover:text-white transition-colors flex items-center justify-center md:justify-start text-xs sm:text-sm">
                  <UserCog size={14} sm:size={16} className="inline-block mr-1 sm:mr-2" />
                  <span>Admin Area</span>
                </Link>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">Contact</h3>
          <p className="text-xs sm:text-sm">123 Design Street</p>
          <p className="text-xs sm:text-sm">Textile City, TX 12345</p>
          <p className="text-xs sm:text-sm mt-2">Email: <a href="mailto:info@textiledesign.com" className="hover:text-white transition-colors">info@textiledesign.com</a></p>
          <p className="text-xs sm:text-sm">Phone: <a href="tel:+15551234567" className="hover:text-white transition-colors">+1 (555) 123-4567</a></p>
        </div>
      </div>
      <div className="text-center text-gray-500 text-xs sm:text-sm mt-8 pt-4 border-t border-gray-800">
        &copy; 2025 Textile Design Studio. All rights reserved.
      </div>
    </footer>
  )
}

export default Footer
