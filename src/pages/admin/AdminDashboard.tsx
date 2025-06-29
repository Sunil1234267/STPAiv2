import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Palette, Layers, ShoppingBag, BarChart2, Shield, DollarSign, Settings, Clock } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

interface AdminDashboardProps {
  session: Session | null;
}

interface Stats {
  totalUsers: number;
  totalDesigns: number;
  totalCollections: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ session }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!session) {
        navigate('/auth');
        return;
      }
      fetchStats();
    };

    loadDashboardData();
  }, [session, navigate]);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      if (usersError) throw usersError;

      // Fetch total designs
      const { count: totalDesigns, error: designsError } = await supabase
        .from('designs')
        .select('*', { count: 'exact', head: true });
      if (designsError) throw designsError;

      // Fetch total collections
      const { count: totalCollections, error: collectionsError } = await supabase
        .from('collections')
        .select('*', { count: 'exact', head: true });
      if (collectionsError) throw collectionsError;

      // Fetch total orders and pending orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('status, total_amount');
      if (ordersError) throw ordersError;

      const totalOrders = ordersData?.length || 0;
      const pendingOrders = ordersData?.filter(order => order.status === 'pending').length || 0;
      const totalRevenue = ordersData?.reduce((sum, order) => sum + order.total_amount, 0) || 0;

      setStats({
        totalUsers: totalUsers || 0,
        totalDesigns: totalDesigns || 0,
        totalCollections: totalCollections || 0,
        totalOrders,
        pendingOrders,
        totalRevenue,
      });
    } catch (err: any) {
      console.error('Error fetching admin stats:', err.message);
      setError('Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  const adminNavItems = [
    { name: 'Manage Users', description: 'View and manage user accounts and roles.', icon: Users, link: '/admin/users' },
    { name: 'Manage Designs', description: 'Oversee all AI-generated and user-uploaded designs.', icon: Palette, link: '/admin/designs' },
    { name: 'Manage Collections', description: 'Review and manage all design collections.', icon: Layers, link: '/admin/collections' },
    { name: 'Manage Orders', description: 'Process and track all customer orders.', icon: ShoppingBag, link: '/admin/orders' },
    { name: 'System Settings', description: 'Configure application-wide settings and parameters.', icon: Settings, link: '/admin/settings' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <div className="text-xl font-semibold text-emerald-600 dark:text-emerald-400">Loading admin dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-8">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-gray-800 dark:text-white text-center mb-6">
            Admin Dashboard
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            Overview and management tools for the entire platform.
          </p>
        </ScrollReveal>

        {error && (
          <div className="text-center py-8 text-red-500 dark:text-red-400">
            <p>{error}</p>
          </div>
        )}

        {stats && (
          <section className="mb-12">
            <ScrollReveal delay={200}>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
                Platform Statistics
              </h2>
            </ScrollReveal>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              <ScrollReveal delay={300}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center border border-slate-200 dark:border-gray-800">
                  <Users size={48} className="text-emerald-600 dark:text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Total Users</h3>
                  <p className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">{stats.totalUsers}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={400}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center border border-slate-200 dark:border-gray-800">
                  <Palette size={48} className="text-cyan-600 dark:text-cyan-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Total Designs</h3>
                  <p className="text-4xl font-bold text-cyan-600 dark:text-cyan-400">{stats.totalDesigns}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={500}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center border border-slate-200 dark:border-gray-800">
                  <Layers size={48} className="text-violet-600 dark:text-violet-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Total Collections</h3>
                  <p className="text-4xl font-bold text-violet-600 dark:text-violet-400">{stats.totalCollections}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={600}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center border border-slate-200 dark:border-gray-800">
                  <ShoppingBag size={48} className="text-rose-600 dark:text-rose-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Total Orders</h3>
                  <p className="text-4xl font-bold text-rose-600 dark:text-rose-400">{stats.totalOrders}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={700}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center border border-slate-200 dark:border-gray-800">
                  <Clock size={48} className="text-amber-600 dark:text-amber-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Pending Orders</h3>
                  <p className="text-4xl font-bold text-amber-600 dark:text-amber-400">{stats.pendingOrders}</p>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={800}>
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 text-center border border-slate-200 dark:border-gray-800">
                  <DollarSign size={48} className="text-green-600 dark:text-green-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Total Revenue</h3>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">${stats.totalRevenue.toFixed(2)}</p>
                </div>
              </ScrollReveal>
            </div>
          </section>
        )}

        <section>
          <ScrollReveal delay={900}>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-6 text-center">
              Admin Tools
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminNavItems.map((item, index) => (
              <ScrollReveal key={item.name} delay={index * 100 + 1000}>
                <div
                  onClick={() => navigate(item.link)}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 flex flex-col items-center text-center cursor-pointer transform hover:scale-105 transition-all duration-300 border border-slate-200 dark:border-gray-800"
                >
                  <item.icon size={48} className="text-emerald-600 dark:text-emerald-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                    {item.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {item.description}
                  </p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;
