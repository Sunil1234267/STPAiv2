import React, { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { BarChart2, Users, Sparkles, LayoutGrid, ShoppingBag, Settings, TrendingUp, Activity, DollarSign } from 'lucide-react'

const AdminDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDesigns: 0,
    totalCollections: 0,
    totalOrders: 0,
    revenueLastMonth: 0,
    activeUsersToday: 0,
  })

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch total users
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      if (usersError) throw usersError

      // Fetch total designs
      const { count: totalDesigns, error: designsError } = await supabase
        .from('designs')
        .select('*', { count: 'exact', head: true })
      if (designsError) throw designsError

      // Fetch total collections
      const { count: totalCollections, error: collectionsError } = await supabase
        .from('collections')
        .select('*', { count: 'exact', head: true })
      if (collectionsError) throw collectionsError

      // Fetch total orders
      const { count: totalOrders, error: ordersError } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
      if (ordersError) throw ordersError

      // Simulate revenue last month (replace with actual query if 'payments' table exists)
      // For now, a placeholder
      const revenueLastMonth = 12345.67; // Placeholder

      // Simulate active users today (requires more complex real-time tracking)
      // For now, a placeholder
      const activeUsersToday = 42; // Placeholder

      setStats({
        totalUsers: totalUsers || 0,
        totalDesigns: totalDesigns || 0,
        totalCollections: totalCollections || 0,
        totalOrders: totalOrders || 0,
        revenueLastMonth,
        activeUsersToday,
      })
    } catch (err: any) {
      console.error('Error fetching admin stats:', err)
      setError('Failed to load admin data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const adminCards = [
    { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500 dark:text-blue-400' },
    { title: 'Total Designs', value: stats.totalDesigns, icon: Sparkles, color: 'text-purple-500 dark:text-purple-400' },
    { title: 'Total Collections', value: stats.totalCollections, icon: LayoutGrid, color: 'text-green-500 dark:text-green-400' },
    { title: 'Total Orders', value: stats.totalOrders, icon: ShoppingBag, color: 'text-yellow-500 dark:text-yellow-400' },
    { title: 'Revenue (Last Month)', value: `$${stats.revenueLastMonth.toFixed(2)}`, icon: DollarSign, color: 'text-teal-500 dark:text-teal-400' },
    { title: 'Active Users (Today)', value: stats.activeUsersToday, icon: Activity, color: 'text-orange-500 dark:text-orange-400' },
  ]

  const quickLinks = [
    { name: 'Manage Users', link: '/admin/users', icon: Users },
    { name: 'Manage Designs', link: '/admin/designs', icon: Sparkles },
    { name: 'Manage Collections', link: '/admin/collections', icon: LayoutGrid },
    { name: 'View Orders', link: '/dashboard/orders', icon: ShoppingBag },
    { name: 'System Settings', link: '/admin/settings', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white p-4 md:p-8 transition-colors duration-300">
      <div className="container mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800 dark:text-white">Admin Dashboard</h1>
        <p className="text-center text-lg text-gray-700 dark:text-gray-300 mb-12">
          Overview of platform statistics and quick access to administrative tools.
        </p>

        {loading && (
          <div className="text-center text-blue-500 dark:text-blue-400 text-lg font-semibold">Loading admin data...</div>
        )}

        {error && (
          <div className="text-center text-red-500 dark:text-red-400 text-lg">{error}</div>
        )}

        {!loading && (
          <>
            {/* Key Metrics */}
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                <BarChart2 size={28} className="mr-3 text-red-600 dark:text-red-400" /> Key Metrics
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {adminCards.map((card) => (
                  <div key={card.title} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex items-center space-x-4 border border-gray-200 dark:border-gray-700">
                    <div className={`p-3 rounded-full bg-gray-100 dark:bg-gray-700 ${card.color}`}>
                      <card.icon size={28} />
                    </div>
                    <div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{card.title}</p>
                      <h3 className="text-2xl font-bold text-gray-800 dark:text-white">{card.value}</h3>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                <Settings size={28} className="mr-3 text-red-600 dark:text-red-400" /> Quick Actions
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {quickLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.link}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 flex flex-col items-center text-center hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 border border-gray-200 dark:border-gray-700"
                  >
                    <link.icon size={40} className="text-blue-600 dark:text-blue-400 mb-3" />
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{link.name}</h3>
                  </a>
                ))}
              </div>
            </section>

            {/* Recent Activity (Placeholder) */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white flex items-center">
                <Activity size={28} className="mr-3 text-red-600 dark:text-red-400" /> Recent Activity
              </h2>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <ul className="space-y-4 text-gray-700 dark:text-gray-300">
                  <li className="flex items-center space-x-3">
                    <TrendingUp size={20} className="text-green-500" />
                    <span>User <span className="font-semibold">user@example.com</span> signed up. <span className="text-xs text-gray-500 dark:text-gray-400">5 mins ago</span></span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Sparkles size={20} className="text-purple-500" />
                    <span>New design <span className="font-semibold">"Abstract Floral"</span> generated. <span className="text-xs text-gray-500 dark:text-gray-400">1 hour ago</span></span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <ShoppingBag size={20} className="text-yellow-500" />
                    <span>Order <span className="font-semibold">#ORD7890</span> completed. <span className="text-xs text-gray-500 dark:text-gray-400">3 hours ago</span></span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <LayoutGrid size={20} className="text-blue-500" />
                    <span>Collection <span className="font-semibold">"Summer Patterns"</span> updated. <span className="text-xs text-gray-500 dark:text-gray-400">1 day ago</span></span>
                  </li>
                </ul>
                <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
                  More detailed activity logs coming soon.
                </p>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default AdminDashboard
