import React, { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Palette, Layers, MessageSquare, ArrowRight, Lightbulb, Settings, Users } from 'lucide-react'
import ScrollReveal from '../components/ScrollReveal'
import { Session } from '@supabase/supabase-js'

interface HomeProps {
  session: Session | null;
}

const Home: React.FC<HomeProps> = ({ session }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center text-center bg-gradient-to-br from-blue-600 to-purple-700 dark:from-blue-800 dark:to-purple-900 text-white p-4 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          {/* More dynamic background pattern */}
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
            <defs>
              <pattern id="pattern-grid" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M20 0L0 0L0 20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5"/>
              </pattern>
              <filter id="blur">
                <feGaussianBlur in="SourceGraphic" stdDeviation="1" />
              </filter>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#pattern-grid)" filter="url(#blur)" />
            <circle cx="20%" cy="30%" r="15%" fill="rgba(255,255,255,0.05)" className="animate-pulse-slow" />
            <circle cx="80%" cy="70%" r="10%" fill="rgba(255,255,255,0.05)" className="animate-pulse-slow delay-500" />
          </svg>
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4">
          <ScrollReveal delay={0}>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 drop-shadow-lg">
              Unleash Your Creativity with AI-Powered Textile Design
            </h1>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-lg md:text-xl mb-10 opacity-90 max-w-2xl mx-auto">
              From concept to collection, streamline your design process, manage orders, and collaborate seamlessly.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={400}>
            <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Link
                to="/designs"
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-full font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <Palette size={24} className="group-hover:rotate-6 transition-transform duration-300" />
                <span>Start Designing</span>
              </Link>
              <Link
                to="/pricing"
                className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-full font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 group"
              >
                <Sparkles size={24} className="group-hover:scale-110 transition-transform duration-300" />
                <span>Explore Plans</span>
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Overview Section */}
      <section className="py-16 md:py-24 bg-white dark:bg-gray-800 p-4 transition-colors duration-300">
        <div className="container mx-auto max-w-6xl text-center">
          <ScrollReveal delay={0}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-12">
              Powerful Features at Your Fingertips
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={100}>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-gray-600 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    <Palette size={48} className="text-blue-600 dark:text-blue-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">AI Design Generation</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Generate unique textile patterns and designs with advanced AI algorithms.
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-gray-600 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-teal-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    <Layers size={48} className="text-green-600 dark:text-green-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Collection Management</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Organize your designs into cohesive collections for easy access and presentation.
                  </p>
                </div>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-8 shadow-md hover:shadow-xl transform hover:-translate-y-2 transition-all duration-300 border border-gray-200 dark:border-gray-600 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-600 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                <div className="relative z-10">
                  <div className="flex justify-center mb-4">
                    <MessageSquare size={48} className="text-purple-600 dark:text-purple-400 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Interactive Chatbot</h3>
                  <p className="text-gray-700 dark:text-gray-300">
                    Get instant support and creative ideas from our intelligent AI chatbot.
                  </p>
                </div>
              </div>
            </ScrollReveal>
          </div>
          <ScrollReveal delay={400}>
            <div className="mt-12">
              <Link
                to="/features"
                className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <span>View All Features</span>
                <ArrowRight size={20} className="ml-2" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 md:py-24 bg-gray-100 dark:bg-gray-900 p-4 transition-colors duration-300">
        <div className="container mx-auto max-w-6xl text-center">
          <ScrollReveal delay={0}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-12">
              How It Works: Simple Steps to Stunning Designs
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <ScrollReveal delay={100}>
              <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 flex items-center justify-center bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
                  <Lightbulb size={32} className="text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">1. Ideate & Generate</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Input your ideas, keywords, or inspirations, and let our AI generate unique textile patterns instantly.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={200}>
              <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 flex items-center justify-center bg-green-100 dark:bg-green-900 rounded-full mb-4">
                  <Settings size={32} className="text-green-600 dark:text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">2. Refine & Organize</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Customize designs, adjust colors, and organize them into cohesive collections for your projects.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={300}>
              <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <div className="w-16 h-16 flex items-center justify-center bg-purple-100 dark:bg-purple-900 rounded-full mb-4">
                  <Users size={32} className="text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">3. Collaborate & Grow</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Share your work, get feedback, and manage orders to scale your textile business effortlessly.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 transition-colors duration-300">
        <div className="container mx-auto max-w-4xl text-center">
          <ScrollReveal delay={0}>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-8">
              Ready to Transform Your Textile Business?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-10">
              Join thousands of designers and businesses who are revolutionizing their workflow with our platform.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={400}>
            {!session && (
              <Link
                to="/auth"
                className="bg-green-600 hover:bg-green-700 text-white px-10 py-4 rounded-full font-bold text-lg shadow-xl transform hover:scale-105 transition-all duration-300"
              >
                Get Started Today
              </Link>
            )}
          </ScrollReveal>
        </div>
      </section>
    </div>
  )
}

export default Home
