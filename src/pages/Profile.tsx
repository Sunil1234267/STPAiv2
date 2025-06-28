import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Edit, Save, Lock, Key, Globe } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

interface ProfileData {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  website: string | null;
  role: string;
  email: string; // Temporarily keep for local state, but not in DB
}

const Profile: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    full_name: '',
    website: '',
  });
  const [passwordChange, setPasswordChange] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSessionAndProfile = async () => {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        await getProfile(session.user.id, session.user.email || '');
      } else {
        setLoading(false);
        navigate('/auth');
      }
    };

    fetchSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getProfile(session.user.id, session.user.email || '');
      } else {
        setLoading(false);
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getProfile = async (userId: string, userEmail: string) => {
    try {
      setLoading(true);
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`id, username, full_name, website, avatar_url, role`)
        .eq('id', userId)
        .single();

      if (error && status !== 406) { // status 406 means "No rows found" for .single()
        throw error;
      }

      if (data) {
        setProfile({ ...data, email: userEmail }); // Add email from session to local state
        setFormData({
          username: data.username || '',
          full_name: data.full_name || '',
          website: data.website || '',
        });
      } else {
        // If no profile exists, create a basic one
        const { error: insertError } = await supabase.from('profiles').insert({
          id: userId,
          username: userEmail.split('@')[0], // Default username from email
          full_name: '',
          website: '',
          role: 'user',
        });
        if (insertError) throw insertError;
        // Re-fetch the newly created profile
        await getProfile(userId, userEmail);
      }
    } catch (error: any) {
      console.error('Error loading or creating user profile:', error.message);
      setMessage('Failed to load profile: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordChange(prev => ({ ...prev, [name]: value }));
  };

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setLoading(true);
    setMessage(null);
    setMessageType(null);

    try {
      const updates = {
        id: session.user.id,
        username: formData.username,
        full_name: formData.full_name,
        website: formData.website,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates, {
        onConflict: 'id', // Specify conflict target for upsert
      });

      if (error) throw error;

      setMessage('Profile updated successfully!');
      setMessageType('success');
      setEditMode(false);
      getProfile(session.user.id, session.user.email || ''); // Re-fetch profile to ensure data consistency
    } catch (error: any) {
      console.error('Error updating profile:', error.message);
      setMessage('Failed to update profile: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const updatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;

    setLoading(true);
    setMessage(null);
    setMessageType(null);

    if (passwordChange.newPassword !== passwordChange.confirmNewPassword) {
      setMessage('New passwords do not match.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    if (passwordChange.newPassword.length < 6) {
      setMessage('New password must be at least 6 characters long.');
      setMessageType('error');
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordChange.newPassword,
      });

      if (error) throw error;

      setMessage('Password updated successfully!');
      setMessageType('success');
      setPasswordChange({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } catch (error: any) {
      console.error('Error updating password:', error.message);
      setMessage('Failed to update password: ' + error.message);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <div className="text-xl font-semibold text-blue-500 dark:text-blue-400">Loading profile...</div>
      </div>
    );
  }

  if (!session || !profile) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <div className="text-xl font-semibold text-red-500 dark:text-red-400">Profile not found or not authorized.</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-8">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            Your Profile
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            Manage your personal information and account settings.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Profile Information */}
          <ScrollReveal delay={200}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                  Personal Information
                </h2>
                <button
                  onClick={() => setEditMode(!editMode)}
                  className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-700 px-4 py-2 rounded-md font-medium flex items-center space-x-2 transition-colors duration-200"
                >
                  <Edit size={18} />
                  <span>{editMode ? 'Cancel' : 'Edit'}</span>
                </button>
              </div>

              {message && messageType === 'success' && (
                <div className="p-3 mb-4 rounded-md bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 text-sm">
                  {message}
                </div>
              )}
              {message && messageType === 'error' && (
                <div className="p-3 mb-4 rounded-md bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200 text-sm">
                  {message}
                </div>
              )}

              <form onSubmit={updateProfile} className="space-y-5">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <div className="relative">
                    <Mail size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      id="email"
                      className="w-full p-3 pl-10 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white cursor-not-allowed"
                      value={profile.email}
                      disabled
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="username"
                      name="username"
                      className="w-full p-3 pl-10 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.username}
                      onChange={handleProfileChange}
                      disabled={!editMode || loading}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="full_name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <User size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      className="w-full p-3 pl-10 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={formData.full_name}
                      onChange={handleProfileChange}
                      disabled={!editMode || loading}
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="website" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Website
                  </label>
                  <div className="relative">
                    <Globe size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      id="website"
                      name="website"
                      className="w-full p-3 pl-10 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="https://yourwebsite.com"
                      value={formData.website}
                      onChange={handleProfileChange}
                      disabled={!editMode || loading}
                    />
                  </div>
                </div>
                {editMode && (
                  <button
                    type="submit"
                    className={`w-full py-3 rounded-md font-bold text-white flex items-center justify-center space-x-2 transition-colors duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                )}
              </form>
            </div>
          </ScrollReveal>

          {/* Change Password */}
          <ScrollReveal delay={300}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Change Password
              </h2>

              {message && messageType === 'success' && (
                <div className="p-3 mb-4 rounded-md bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200 text-sm">
                  {message}
                </div>
              )}
              {message && messageType === 'error' && (
                <div className="p-3 mb-4 rounded-md bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-200 text-sm">
                  {message}
                </div>
              )}

              <form onSubmit={updatePassword} className="space-y-5">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <div className="relative">
                    <Lock size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      className="w-full p-3 pl-10 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={passwordChange.currentPassword}
                      onChange={handlePasswordChange}
                      disabled={loading}
                      autoComplete="current-password"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Key size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      className="w-full p-3 pl-10 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={passwordChange.newPassword}
                      onChange={handlePasswordChange}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Key size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="password"
                      id="confirmNewPassword"
                      name="confirmNewPassword"
                      className="w-full p-3 pl-10 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={passwordChange.confirmNewPassword}
                      onChange={handlePasswordChange}
                      disabled={loading}
                      autoComplete="new-password"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className={`w-full py-3 rounded-md font-bold text-white flex items-center justify-center space-x-2 transition-colors duration-200 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <Lock size={20} />
                      <span>Update Password</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default Profile;
