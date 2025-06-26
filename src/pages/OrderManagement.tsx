import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { ShoppingBag, Package, Truck, CheckCircle, XCircle, Clock, DollarSign, Info } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal'; // Import ScrollReveal

interface OrderManagementProps {
  session: Session | null;
  userRole: string | null;
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
}

const OrderManagement: React.FC<OrderManagementProps> = ({ session, userRole }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchOrders();
    } else {
      setLoading(false);
      setError('Please sign in to view your orders.');
    }
  }, [session]);

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
          )
        `);

      if (userRole !== 'admin') {
        query = query.eq('user_id', session?.user?.id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const formattedOrders: Order[] = data.map((order: any) => ({
        ...order,
        design_title: order.designs?.title,
        design_image_url: order.designs?.image_url,
      }));
      setOrders(formattedOrders);
    } catch (err: any) {
      console.error('Error fetching orders:', err.message);
      setError('Failed to load orders. Please try again later.');
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

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-8">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            {userRole === 'admin' ? 'All Orders' : 'My Orders'}
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            Track the status of your textile design orders.
          </p>
        </ScrollReveal>

        {loading && (
          <div className="text-center py-8">
            <p className="text-blue-500 dark:text-blue-400">Loading orders...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500 dark:text-red-400">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>No orders found.</p>
            {userRole !== 'admin' && (
              <p className="mt-2">Start by generating a design and placing an order!</p>
            )}
          </div>
        )}

        <div className="space-y-6">
          {orders.map((order, index) => (
            <ScrollReveal key={order.id} delay={index * 100 + 200}> {/* Staggered delay */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col md:flex-row items-start md:items-center justify-between border border-gray-200 dark:border-gray-700 transform hover:scale-[1.01] transition-transform duration-200">
                <div className="flex items-center mb-4 md:mb-0 md:w-1/2">
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
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Ordered on: {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderManagement;
