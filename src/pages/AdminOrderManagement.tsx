import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { Session } from '@supabase/supabase-js'
import { Tables } from '../types/supabase'
import { Eye, Edit, Trash2, Loader2, CheckCircle, XCircle, FileText, DollarSign, Calendar, User } from 'lucide-react'

interface AdminOrderManagementProps {
  session: Session | null
}

const AdminOrderManagement: React.FC<AdminOrderManagementProps> = ({ session }) => {
  const [orders, setOrders] = useState<Tables<'orders'>[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Tables<'orders'> | null>(null)
  const [editStatus, setEditStatus] = useState('')
  const [editQuote, setEditQuote] = useState<string>('')

  useEffect(() => {
    if (session) {
      fetchOrders()
    } else {
      setLoading(false)
      setError('Please log in as an admin to view orders.')
    }
  }, [session])

  const fetchOrders = async () => {
    setLoading(true)
    setError(null)
    if (!session?.user?.id) {
      setError('User not authenticated.')
      setLoading(false)
      return
    }

    try {
      // Admins can view all orders due to RLS policy
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setOrders(data || [])
    } catch (err: any) {
      console.error('Error fetching orders:', err)
      setError('Failed to load orders: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleOpenEditModal = (order: Tables<'orders'>) => {
    setCurrentOrder(order)
    setEditStatus(order.status)
    setEditQuote(order.quote_amount?.toString() || '')
    setShowModal(true)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setCurrentOrder(null)
  }

  const handleUpdateOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    if (!session?.user?.id || !currentOrder) {
      setError('User not authenticated or no order selected.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: editStatus,
          quote_amount: editQuote ? parseFloat(editQuote) : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', currentOrder.id)

      if (error) throw error
      await fetchOrders() // Re-fetch to get latest data
      handleCloseModal()
    } catch (err: any) {
      console.error('Error updating order:', err)
      setError('Failed to update order: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteOrder = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return
    }
    setLoading(true)
    setError(null)
    if (!session?.user?.id) {
      setError('User not authenticated.')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (error) throw error
      setOrders(orders.filter((o) => o.id !== id))
    } catch (err: any) {
      console.error('Error deleting order:', err)
      setError('Failed to delete order: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-300">
        <div className="text-xl font-semibold text-blue-500 dark:text-blue-400">Loading admin orders...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-red-500 dark:text-red-400 flex items-center justify-center p-4 transition-colors duration-300">
        Error: {error}
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center p-4 transition-colors duration-300">
        <p className="text-xl font-semibold">Please log in as an admin to view this page.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-8 transition-colors duration-300">
      <div className="container mx-auto max-w-6xl">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">Admin Order Management</h1>
        <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-12">
          View and manage all customer orders.
        </p>

        {orders.length === 0 ? (
          <div className="text-center text-gray-600 dark:text-gray-400 text-xl py-12">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Order ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    User ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Quote
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {order.user_id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 capitalize">
                      {order.order_type.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        order.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      } transition-colors duration-300`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {order.quote_amount !== null ? `₹${order.quote_amount.toFixed(2)}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                      {new Date(order.created_at!).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleOpenEditModal(order)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3 transition-colors"
                        title="Edit Order"
                      >
                        <Edit size={20} />
                      </button>
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={20} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Modal for Edit Order */}
        {showModal && currentOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-md border border-gray-200 dark:border-gray-700 transition-colors duration-300">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Edit Order</h2>
                <button onClick={handleCloseModal} className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white">
                  <XCircle size={24} />
                </button>
              </div>
              <form onSubmit={handleUpdateOrder} className="space-y-5">
                <p className="text-gray-700 dark:text-gray-300">Order ID: <span className="font-mono text-sm">{currentOrder.id}</span></p>
                <p className="text-gray-700 dark:text-gray-300 flex items-center"><User size={16} className="mr-2" /> User ID: <span className="font-mono text-sm">{currentOrder.user_id}</span></p>
                <p className="text-gray-700 dark:text-gray-300">Order Type: <span className="capitalize">{currentOrder.order_type.replace(/_/g, ' ')}</span></p>
                {currentOrder.details && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Details</label>
                    <pre className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-white text-sm overflow-x-auto">
                      {JSON.stringify(currentOrder.details, null, 2)}
                    </pre>
                  </div>
                )}
                <div>
                  <label htmlFor="editStatus" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select
                    id="editStatus"
                    name="editStatus"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="editQuote" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quote Amount (₹)</label>
                  <input
                    type="number"
                    id="editQuote"
                    name="editQuote"
                    value={editQuote}
                    onChange={(e) => setEditQuote(e.target.value)}
                    className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 1500.00"
                    step="0.01"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  <CheckCircle size={20} />
                  <span>Update Order</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrderManagement
