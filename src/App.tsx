import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import { ThemeProvider } from './contexts/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Designs from './pages/Designs';
import Contact from './pages/Contact';
import About from './pages/About';
import Pricing from './pages/Pricing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import OrderManagement from './pages/OrderManagement';
import Chatbot from './pages/Chatbot';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminDesigns from './pages/admin/AdminDesigns';
import AdminOrderManagement from './pages/admin/AdminOrderManagement';
import AdminUsers from './pages/admin/AdminUsers';
import ContributorDashboard from './pages/ContributorDashboard';
import Features from './pages/Features';

const AppContent: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingAuthData, setLoadingAuthData] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  // Function to fetch user role and update state
  const fetchUserRole = async (userId: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      const role = data?.role || 'user';
      setUserRole(role);
      return role;
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user'); // Default to user role on error
      return 'user';
    }
  };

  useEffect(() => {
    const loadAuthData = async () => {
      setLoadingAuthData(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          const role = await fetchUserRole(session.user.id); // Fetch role and wait for it
          // Redirect based on role if on root, generic dashboard, or auth page
          if (location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/auth') {
            if (role === 'admin') {
              navigate('/admin/dashboard', { replace: true });
            } else if (role === 'contributor') {
              navigate('/contributor/dashboard', { replace: true });
            } else { // Default to general user dashboard
              navigate('/dashboard', { replace: true });
            }
          }
        } else {
          setUserRole(null);
          // If no session and not on auth or home page, redirect to auth
          if (location.pathname !== '/auth' && location.pathname !== '/') {
            navigate('/auth', { replace: true });
          }
        }
      } catch (error) {
        console.error('Error loading authentication data:', error);
        setSession(null);
        setUserRole(null);
      } finally {
        setLoadingAuthData(false);
      }
    };

    loadAuthData();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserRole(session.user.id).then(role => {
          // This part is crucial for real-time auth state changes (e.g., after sign-in/sign-up)
          // Always redirect from /auth, or if on root/generic dashboard
          if (location.pathname === '/' || location.pathname === '/dashboard' || location.pathname === '/auth') {
            if (role === 'admin') {
              navigate('/admin/dashboard', { replace: true });
            } else if (role === 'contributor') {
              navigate('/contributor/dashboard', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          }
        });
      } else {
        setUserRole(null);
        if (location.pathname !== '/auth' && location.pathname !== '/') {
          navigate('/auth', { replace: true });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname, navigate]);

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  if (loadingAuthData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <div className="text-xl font-semibold text-blue-500 dark:text-blue-400">Loading application...</div>
      </div>
    );
  }

  console.log('AppContent rendering. Session:', session, 'User Role:', userRole, 'Current Path:', location.pathname);

  return (
    <div className="flex flex-col min-h-screen">
      <Header session={session} userRole={userRole} />
      <main className="flex-grow">
        <Routes>
          {/* Root path redirection handled by useEffect based on role */}
          <Route path="/" element={session ? <Dashboard session={session} userRole={userRole} /> : <Home session={session} />} />
          <Route path="/designs" element={<Designs session={session} userRole={userRole} />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/about" element={<About />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/auth" element={<Auth session={session} />} />
          <Route path="/dashboard" element={<Dashboard session={session} userRole={userRole} />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/orders" element={<OrderManagement session={session} userRole={userRole} />} />
          <Route path="/chatbot" element={<Chatbot session={session} />} />
          <Route path="/features" element={<Features />} />

          {/* Admin Routes */}
          {userRole === 'admin' && (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboard session={session} />} />
              <Route path="/admin/users" element={<AdminUsers session={session} />} />
              <Route path="/admin/designs" element={<AdminDesigns session={session} />} />
              <Route path="/admin/orders" element={<AdminOrderManagement session={session} />} />
            </>
          )}
          {/* Fallback for unauthorized admin access */}
          {userRole !== 'admin' && (
            <Route path="/admin/*" element={
              <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-red-500 dark:text-red-400 flex items-center justify-center p-4 transition-colors duration-300">
                <p className="text-xl font-semibold">Access Denied: You do not have administrative privileges.</p>
              </div>
            } />
          )}

          {/* Contributor Routes */}
          {userRole === 'contributor' && (
            <>
              <Route path="/contributor/dashboard" element={<ContributorDashboard session={session} />} />
              {/* Add other contributor-specific routes here */}
              <Route path="/contributor/upload-design" element={<div>Upload Design Page (Placeholder)</div>} />
              <Route path="/contributor/my-submissions" element={<div>My Submissions Page (Placeholder)</div>} />
              <Route path="/contributor/chat" element={<div>Chat with Admin Page (Placeholder)</div>} />
            </>
          )}
          {/* Fallback for unauthorized contributor access */}
          {userRole !== 'contributor' && (
            <Route path="/contributor/*" element={
              <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-red-500 dark:text-red-400 flex items-center justify-center p-4 transition-colors duration-300">
                <p className="text-xl font-semibold">Access Denied: You do not have contributor privileges.</p>
              </div>
            } />
          )}
        </Routes>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  );
};

export default App;
