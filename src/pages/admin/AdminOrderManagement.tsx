import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock, DollarSign, Info, User, Edit, Save, Filter, Search } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal'; // Import ScrollReveal

interface AdminOrderManagementProps {
  session: Session | null;
}

interface Order {
  id: string;
  user_id: string;
  design_id: string;
  quantity: number;
  total_price: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  created_at: string;
  design_title?: string;
  design_image_url?: string;
  user_email?: string;
  user_username?: string;
}

const AdminOrderManagement: React.FC<AdminOrderManagementProps> = ({ session }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | Order['status']>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const checkAdminAndFetchOrders = async () => {
      if (!session) {
        navigate('/auth');
        return;
      }

      try {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', session.user.id)
          .single();

        if (profileError || profileData?.role !== 'admin') {
          navigate('/dashboard');
          return;
        }

        fetchOrders();
      } catch (err: any) {
        console.error('Error checking admin role:', err.message);
        navigate('/dashboard');
      }
    };

    checkAdminAndFetchOrders();
  }, [session, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('orders')
        .select(`
          id,
          user_id,
          design_id,
          quantity,
          total_price,
          status,
          created_at,
          designs (
            title,
            image_url
          ),
          profiles (
            username,
            email
          )
        `);

      if (filterStatus !== 'all') {
        query = query.eq('status', filterStatus);
      }

      if (searchTerm) {
        query = query.or(`id.ilike.%${searchTerm}%,designs.title.ilike.%${searchTerm}%,profiles.username.ilike.%${searchTerm}%,profiles.email.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders: Order[] = data.map((order: any) => ({
        ...order,
        design_title: order.designs?.title,
        design_image_url: order.designs?.image_url,
        user_email: order.profiles?.email,
        user_username: order.profiles?.username,
      }));
      setOrders(formattedOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err.message);
      setError('Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      fetchOrders(); // Re-fetch to update the list
      alert('Order status updated successfully!');
    } catch (err: any) {
      console.error('Error updating order status:', err.message);
      setError('Failed to update order status.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: Order['status']) => {
    switch (status) {
      case 'pending': return <Clock size={20} className="text-yellow-500" />;
      case 'processing': return <Package size={20} className="text-blue-500" />;
      case 'shipped': return <Truck size={20} className="text-purple-500" />;
      case 'delivered': return <CheckCircle size={20} className="text-green-500" />;
      case 'cancelled': return <XCircle size={20} className="text-red-500" />;
      default: return <Info size={20} className="text-gray-500" />;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <div className="text-xl font-semibold text-blue-500 dark:text-blue-400">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-8">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            Admin: Manage Orders
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            Process and track all customer orders.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <div className="flex flex-col md:flex-row gap-4 mb-8 justify-end items-center">
            <div className="relative w-full md:w-auto flex-grow">
              <input
                type="text"
                placeholder="Search by Order ID, Design, User..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative w-full md:w-48">
              <select
                className="w-full p-3 pl-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | Order['status'])}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <button
              onClick={fetchOrders}
              className="w-full md:w-auto bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
            >
              Apply Filters
            </button>
          </div>
        </ScrollReveal>

        {error && (
          <div className="text-center py-8 text-red-500 dark:text-red-400">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>No orders found matching your criteria.</p>
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order, index) => (
            <ScrollReveal key={order.id} delay={index * 100 + 300}> {/* Staggered delay */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between border border-gray-200 dark:border-gray-700 transform hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-start mb-4 md:mb-0 md:w-1/2">
                  {order.design_image_url && (
                    <img
                      src={order.design_image_url}
                      alt={order.design_title || 'Design'}
                      className="w-24 h-24 object-cover rounded-md mr-4 border border-gray-300 dark:border-gray-600"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-1">
                      Order #{order.id.substring(0, 8)}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300 text-lg">
                      {order.design_title || 'Unknown Design'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm flex items-center">
                      <User size={14} className="mr-1" />
                      <span>By: {order.user_username || order.user_email || 'Unknown User'}</span>
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Quantity: {order.quantity}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row md:w-1/2 justify-end items-start md:items-center space-y-3 md:space-y-0 md:space-x-6">
                  <div className="flex items-center space-x-2">
                    <DollarSign size={20} className="text-green-600 dark:text-green-400" />
                    <span className="text-lg font-bold text-gray-800 dark:text-white">
                      ${order.total_price.toFixed(2)}
                    </span>
                  </div>
                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                  </div>
                  <div className="relative">
                    <select
                      className="w-full p-2 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                      value={order.status}
                      onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as Order['status'])}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminOrderManagement;
