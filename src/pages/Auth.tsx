import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, UserPlus, LogIn } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

interface AuthProps {
  session: Session | null;
}

const Auth: React.FC<AuthProps> = ({ session }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setMessageType(null);

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: {
              role: 'user', // Default role for new users
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          setMessage('Sign up successful! You can now log in.');
          setMessageType('success');
          setIsSignUp(false); // Switch to login form after successful sign up
        } else {
          setMessage('Sign up successful! Please check your email for a confirmation link.');
          setMessageType('success');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        setMessage('Logged in successfully!');
        setMessageType('success');
        // App.tsx's useEffect will handle the redirection based on the session and role
      }
    } catch (error: any) {
      setMessage(error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (session) {
    // If session exists, App.tsx's useEffect will handle the redirection
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-500 to-purple-600 dark:from-gray-900 dark:to-black text-gray-900 dark:text-white transition-colors duration-300">
      <ScrollReveal delay={0}>
        <div className="bg-white dark:bg-gray-800 p-10 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200 dark:border-gray-700 transform transition-all duration-300 hover:scale-[1.01] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-700/50 dark:to-gray-800/50 opacity-20 rounded-2xl"></div>
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold text-center mb-4 text-gray-800 dark:text-white tracking-tight">
              {isSignUp ? 'Create Account' : 'Welcome Back!'}
            </h1>
            <p className="text-center text-gray-600 dark:text-gray-400 mb-8 text-lg">
              {isSignUp ? 'Join us to explore amazing designs.' : 'Sign in to continue to your dashboard.'}
            </p>

            {message && (
              <div className={`p-3 mb-6 rounded-lg text-sm ${messageType === 'success' ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200'}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    className="w-full p-3.5 pl-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="your.email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="password"
                    id="password"
                    className="w-full p-3.5 pl-10 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-base"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
              <button
                type="submit"
                className={`w-full py-3.5 rounded-lg font-bold text-white flex items-center justify-center space-x-2 transition-all duration-300 transform hover:-translate-y-0.5 shadow-lg ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'}`}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{isSignUp ? 'Signing Up...' : 'Signing In...'}</span>
                  </>
                ) : (
                  <>
                    {isSignUp ? <UserPlus size={20} /> : <LogIn size={20} />}
                    <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-blue-600 dark:text-blue-400 hover:underline text-base transition-colors duration-200 hover:text-blue-700 dark:hover:text-blue-300"
                disabled={loading}
              >
                {isSignUp ? 'Already have an account? Sign In' : 'Don\'t have an account? Sign Up'}
              </button>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default Auth;
