import React, { useContext, useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { Session } from '@supabase/supabase-js'
import { ThemeContext } from '../contexts/ThemeContext'
import ThemeToggle from './ThemeToggle'
import { Menu, X, LogOut, User, LayoutDashboard, Palette, DollarSign, Home as HomeIcon, Settings, Shield, ShoppingBag } from 'lucide-react'

interface HeaderProps {
  session: Session | null
  userRole: string | null
}

const Header: React.FC<HeaderProps> = ({ session, userRole }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme } = useContext(ThemeContext)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error.message)
    } else {
      navigate('/auth')
    }
    setIsMobileMenuOpen(false)
  }

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Define navigation links. Home link is conditional based on session.
  const navLinks = [
    { name: 'Designs', path: '/designs', icon: Palette },
    { name: 'Pricing', path: '/pricing', icon: DollarSign },
  ];

  // Function to determine the class names for desktop navigation links based on the current path
  const getLinkClassName = (path: string) => {
    const baseClasses = "px-3 py-2 rounded-md font-medium transition-colors duration-200";
    const inactiveClasses = "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
    const activeClasses = "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold";
    return `${baseClasses} ${location.pathname === path ? activeClasses : inactiveClasses}`;
  };

  // Function to determine the class names for mobile navigation links based on the current path
  const getMobileLinkClassName = (path: string) => {
    const baseClasses = "w-full px-4 py-2 rounded-md flex items-center space-x-3 transition-colors duration-200";
    const inactiveClasses = "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700";
    const activeClasses = "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 font-bold";
    return `${baseClasses} ${location.pathname === path ? activeClasses : inactiveClasses}`;
  };

  return (
    <header className="bg-white dark:bg-gray-800 shadow-md dark:shadow-lg sticky top-0 z-40 transition-colors duration-300">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-gray-800 dark:text-white flex items-center space-x-2">
          <img src={`/logo-${theme}.png`} alt="Logo" className="h-8 w-auto" />
          <span>SunilTextile.AI</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-2">
          {!session && ( // Show Home link only if not signed in
            <Link
              to="/"
              className={getLinkClassName('/')}
            >
              Home
            </Link>
          )}
          {session && ( // Render Dashboard first if session exists
            <Link
              to="/dashboard"
              className={getLinkClassName('/dashboard')}
            >
              Dashboard
            </Link>
          )}
          {navLinks.map((link) => (
            <Link
              key={link.name}
              to={link.path}
              className={getLinkClassName(link.path)}
            >
              {link.name}
            </Link>
          ))}
          {session ? (
            <>
              <Link
                to="/profile"
                className={getLinkClassName('/profile')}
              >
                Profile
              </Link>
              {userRole === 'admin' && (
                <Link
                  to="/admin/dashboard"
                  className={getLinkClassName('/admin/dashboard')}
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="ml-4 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-1"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            location.pathname !== '/auth' && ( // Conditionally render Sign In button
              <Link
                to="/auth"
                className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200"
              >
                Sign In
              </Link>
            )
          )}
          <ThemeToggle />
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center space-x-2">
          <ThemeToggle />
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 dark:text-gray-300">
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-lg pb-4 transition-colors duration-300">
          <nav className="flex flex-col items-start px-4 space-y-2">
            {!session && ( // Show Home link only if not signed in
              <Link
                to="/"
                className={getMobileLinkClassName('/')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <HomeIcon size={20} />
                <span>Home</span>
              </Link>
            )}
            {session && ( // Render Dashboard first if session exists
              <Link
                to="/dashboard"
                className={getMobileLinkClassName('/dashboard')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
            )}
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={getMobileLinkClassName(link.path)}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <link.icon size={20} />
                <span>{link.name}</span>
              </Link>
            ))}
            {session ? (
              <>
                <Link
                  to="/profile"
                  className={getMobileLinkClassName('/profile')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={20} />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/orders"
                  className={getMobileLinkClassName('/orders')}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <ShoppingBag size={20} />
                  <span>My Orders</span>
                </Link>
                {userRole === 'admin' && (
                  <Link
                    to="/admin/dashboard"
                    className={getMobileLinkClassName('/admin/dashboard')}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Shield size={20} />
                    <span>Admin Dashboard</span>
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="w-full text-left bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-3"
                >
                  <LogOut size={20} />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              location.pathname !== '/auth' && ( // Conditionally render Sign In button for mobile
                <Link
                  to="/auth"
                  className="w-full text-left bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 flex items-center space-x-3"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <User size={20} />
                  <span>Sign In / Sign Up</span>
                </Link>
              )
            )}
          </nav>
        </div>
      )}
    </header>
  )
}

export default Header;
