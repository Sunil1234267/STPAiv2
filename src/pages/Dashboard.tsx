import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Palette, ShoppingBag, MessageSquare, User, Settings, DollarSign, Shield } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal'; // Import ScrollReveal

interface DashboardProps {
  session: Session | null;
  userRole: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ session, userRole }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) {
      navigate('/auth');
    } else {
      setLoading(false);
    }
  }, [session, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <div className="text-xl font-semibold text-blue-500 dark:text-blue-400">Loading dashboard...</div>
      </div>
    );
  }

  const dashboardItems = [
    { name: 'My Designs', description: 'View and manage your AI-generated textile designs.', icon: Palette, link: '/designs' },
    { name: 'My Orders', description: 'Track the status of your textile orders.', icon: ShoppingBag, link: '/orders' },
    { name: 'Chatbot Assistant', description: 'Get instant help and creative ideas from our AI chatbot.', icon: MessageSquare, link: '/chatbot' },
    // Removed 'Profile Settings'
  ];

  if (userRole === 'admin') {
    dashboardItems.push({ name: 'Admin Panel', description: 'Access administrative tools and user management.', icon: Shield, link: '/admin/dashboard' });
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-8">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            Welcome to Your Dashboard, {session?.user?.email?.split('@')[0].charAt(0).toUpperCase() + session?.user?.email?.split('@')[0].slice(1) || 'User'}!
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            Quick access to all your tools and resources.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dashboardItems.map((item, index) => (
            <ScrollReveal key={item.name} delay={index * 100 + 200}> {/* Staggered delay */}
              <div
                onClick={() => navigate(item.link)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center text-center cursor-pointer transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700"
              >
                <item.icon size={48} className="text-blue-600 dark:text-blue-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {item.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
