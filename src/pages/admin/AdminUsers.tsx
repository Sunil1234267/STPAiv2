import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Briefcase, Edit, Trash2, Loader2, Search } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

interface AdminUsersProps {
  session: Session | null;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  phone_number: string | null;
  address: string | null;
  avatar_url: string | null;
  updated_at: string | null;
}

const AdminUsers: React.FC<AdminUsersProps> = ({ session }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAdminAndFetchUsers = async () => {
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

        fetchUsers();
      } catch (err: any) {
        console.error('Error checking admin role:', err.message);
        setError('Failed to verify admin privileges.');
        navigate('/dashboard');
      }
    };

    checkAdminAndFetchUsers();
  }, [session, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false }); // Assuming 'created_at' exists or use 'updated_at'

      if (searchTerm) {
        query = query.ilike('full_name', `%${searchTerm}%`).or(`email.ilike.%${searchTerm}%`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err: any) {
      console.error('Error fetching users:', err.message);
      setError('Failed to load user data.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: newRole, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (updateError) throw updateError;

      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );
    } catch (err: any) {
      console.error('Error updating user role:', err.message);
      setError(`Failed to update role for user ${userId}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // First, delete related data (e.g., designs, collections, orders, saved_items)
      // This is a simplified example; in a real app, you'd handle dependencies carefully
      // For a robust solution, consider a Supabase Function that handles cascade deletion
      // or proper foreign key constraints with ON DELETE CASCADE.
      // For now, we'll attempt to delete related data from client-side.
      await supabase.from('designs').delete().eq('user_id', userId);
      await supabase.from('collections').delete().eq('user_id', userId);
      await supabase.from('orders').delete().eq('user_id', userId);
      await supabase.from('saved_items').delete().eq('user_id', userId);

      // Then, delete the user's profile
      const { error: profileDeleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);
      if (profileDeleteError) throw profileDeleteError;

      // IMPORTANT: Deleting from auth.users table directly from client-side is generally
      // not recommended due to security implications and requires a service role key
      // or a custom Supabase function. For this example, we'll assume the profile
      // deletion is sufficient or that a backend process handles auth.users deletion.
      // If you have a custom function, you'd call it here:
      // const { data, error: authDeleteError } = await supabase.rpc('delete_user_and_data', { user_id_to_delete: userId });
      // if (authDeleteError) throw authDeleteError;

      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    } catch (err: any) {
      console.error('Error deleting user:', err.message);
      setError(`Failed to delete user ${userId}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <div className="text-xl font-semibold text-blue-500 dark:text-blue-400">Loading user data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-8">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            Manage Users
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            View, edit, and manage user accounts and roles.
          </p>
        </ScrollReveal>

        {error && (
          <div className="text-center py-8 text-red-500 dark:text-red-400">
            <p>{error}</p>
          </div>
        )}

        {isSubmitting && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg flex items-center">
              <Loader2 className="animate-spin mr-3 text-blue-500" size={24} />
              <span className="text-gray-800 dark:text-white">Processing...</span>
            </div>
          </div>
        )}

        <ScrollReveal delay={200}>
          <div className="mb-8 flex justify-center">
            <div className="relative w-full max-w-md">
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                onClick={fetchUsers}
                className="absolute right-0 top-0 h-full px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg transition-colors duration-200"
              >
                Search
              </button>
            </div>
          </div>
        </ScrollReveal>

        {users.length === 0 ? (
          <ScrollReveal delay={300}>
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <p className="text-lg">No users found.</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user, index) => (
              <ScrollReveal key={user.id} delay={index * 100 + 300}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 flex flex-col">
                  <div className="flex items-center mb-4">
                    {user.avatar_url ? (
                      <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-blue-500" />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mr-4">
                        <User size={32} className="text-blue-500" />
                      </div>
                    )}
                    <div>
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{user.full_name || 'N/A'}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ID: {user.id.substring(0, 8)}...</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 flex-grow">
                    <p className="flex items-center"><Mail size={18} className="mr-2 text-blue-500" /> {user.email || 'N/A'}</p>
                    <p className="flex items-center"><Phone size={18} className="mr-2 text-blue-500" /> {user.phone_number || 'N/A'}</p>
                    <p className="flex items-center"><MapPin size={18} className="mr-2 text-blue-500" /> {user.address || 'N/A'}</p>
                    <p className="flex items-center"><Briefcase size={18} className="mr-2 text-blue-500" /> Role: <span className="font-medium ml-1">{user.role || 'user'}</span></p>
                  </div>
                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => handleRoleChange(user.id, e.target.value)}
                      className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
                      disabled={isSubmitting}
                    >
                      <option value="user">User</option>
                      <option value="contributor">Contributor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <button
                      onClick={() => handleDeleteUser(user.id)}
                      className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-200"
                      disabled={isSubmitting}
                    >
                      <Trash2 size={20} className="mr-2" /> Delete
                    </button>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
