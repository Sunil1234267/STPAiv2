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
import Features from './pages/Features';

const AppContent: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loadingAuthData, setLoadingAuthData] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const loadAuthData = async () => {
      setLoadingAuthData(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        if (session) {
          await fetchUserRole(session.user.id);
          if (location.pathname === '/') {
            navigate('/dashboard', { replace: true });
          }
        } else {
          setUserRole(null);
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
        fetchUserRole(session.user.id);
        if (location.pathname === '/') {
          navigate('/dashboard', { replace: true });
        }
      } else {
        setUserRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [location.pathname, navigate]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setUserRole(data?.role || 'user');
    } catch (error) {
      console.error('Error fetching user role:', error);
      setUserRole('user');
    }
  };

  if (loadingAuthData) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <div className="text-xl font-semibold text-blue-500 dark:text-blue-400">Loading application...</div>
      </div>
    );
  }

  console.log('AppContent rendering. Session:', session, 'User Role:', userRole);

  return (
    <div className="flex flex-col min-h-screen">
      <Header session={session} userRole={userRole} />
      <main className="flex-grow">
        <Routes>
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

          {userRole === 'admin' && (
            <>
              <Route path="/admin/dashboard" element={<AdminDashboard session={session} />} />
              <Route path="/admin/users" element={<AdminUsers session={session} />} />
              <Route path="/admin/designs" element={<AdminDesigns session={session} />} />
              <Route path="/admin/orders" element={<AdminOrderManagement session={session} />} />
            </>
          )}
          {userRole !== 'admin' && (
            <Route path="/admin/*" element={
              <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-red-500 dark:text-red-400 flex items-center justify-center p-4 transition-colors duration-300">
                <p className="text-xl font-semibold">Access Denied: You do not have administrative privileges.</p>
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
