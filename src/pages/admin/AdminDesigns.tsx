import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Image, User, CheckCircle, XCircle, Trash2, Loader2, Search } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';

interface AdminDesignsProps {
  session: Session | null;
}

interface Design {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  image_url: string;
  is_public: boolean;
  created_at: string;
  updated_at: string | null;
  profiles: {
    username: string | null;
    email: string | null;
  } | null;
}

const AdminDesigns: React.FC<AdminDesignsProps> = ({ session }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const checkAdminAndFetchDesigns = async () => {
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

        fetchDesigns();
      } catch (err: any) {
        console.error('Error checking admin role:', err.message);
        setError('Failed to verify admin privileges.');
        navigate('/dashboard');
      }
    };

    checkAdminAndFetchDesigns();
  }, [session, navigate]);

  const fetchDesigns = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('designs')
        .select(`
          id,
          user_id,
          title,
          description,
          image_url,
          is_public,
          created_at,
          updated_at,
          profiles (
            username,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data, error: fetchError } = await query;
      if (fetchError) throw fetchError;
      setDesigns(data || []);
    } catch (err: any) {
      console.error('Error fetching designs:', err.message);
      setError('Failed to load design data.');
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePublic = async (designId: string, currentIsPublic: boolean) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('designs')
        .update({ is_public: !currentIsPublic, updated_at: new Date().toISOString() })
        .eq('id', designId);

      if (updateError) throw updateError;

      setDesigns(prevDesigns =>
        prevDesigns.map(design =>
          design.id === designId ? { ...design, is_public: !currentIsPublic } : design
        )
      );
    } catch (err: any) {
      console.error('Error updating design public status:', err.message);
      setError(`Failed to update public status for design ${designId}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!window.confirm('Are you sure you want to delete this design? This action cannot be undone.')) {
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      // Delete related entries in collection_designs first
      const { error: collectionDesignsError } = await supabase
        .from('collection_designs')
        .delete()
        .eq('design_id', designId);
      if (collectionDesignsError) throw collectionDesignsError;

      // Then delete the design itself
      const { error: designDeleteError } = await supabase
        .from('designs')
        .delete()
        .eq('id', designId);
      if (designDeleteError) throw designDeleteError;

      setDesigns(prevDesigns => prevDesigns.filter(design => design.id !== designId));
    } catch (err: any) {
      console.error('Error deleting design:', err.message);
      setError(`Failed to delete design ${designId}.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <div className="text-xl font-semibold text-blue-500 dark:text-blue-400">Loading design data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-8">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            Manage Designs
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            Oversee all AI-generated and user-uploaded designs.
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
                placeholder="Search designs by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-3 pl-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <button
                onClick={fetchDesigns}
                className="absolute right-0 top-0 h-full px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg transition-colors duration-200"
              >
                Search
              </button>
            </div>
          </div>
        </ScrollReveal>

        {designs.length === 0 ? (
          <ScrollReveal delay={300}>
            <div className="text-center py-12 text-gray-600 dark:text-gray-400">
              <p className="text-lg">No designs found.</p>
            </div>
          </ScrollReveal>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {designs.map((design, index) => (
              <ScrollReveal key={design.id} delay={index * 100 + 300}>
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700 flex flex-col">
                  <img
                    src={design.image_url}
                    alt={design.title}
                    className="w-full h-48 object-cover rounded-md mb-4 border border-gray-300 dark:border-gray-600"
                  />
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{design.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 flex-grow">{design.description || 'No description provided.'}</p>
                  <div className="space-y-2 text-gray-700 dark:text-gray-300 mb-4">
                    <p className="flex items-center text-sm"><User size={16} className="mr-2 text-blue-500" /> By: {design.profiles?.username || design.profiles?.email || 'Unknown'}</p>
                    <p className="flex items-center text-sm">
                      <Image size={16} className="mr-2 text-blue-500" /> Status:
                      <span className={`ml-1 font-medium ${design.is_public ? 'text-green-600' : 'text-red-600'}`}>
                        {design.is_public ? 'Public' : 'Private'}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Created: {new Date(design.created_at).toLocaleDateString()}</p>
                    {design.updated_at && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Updated: {new Date(design.updated_at).toLocaleDateString()}</p>
                    )}
                  </div>
                  <div className="mt-auto flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => handleTogglePublic(design.id, design.is_public)}
                      className={`flex-grow py-2 px-4 rounded-md flex items-center justify-center transition-colors duration-200 ${
                        design.is_public
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      }`}
                      disabled={isSubmitting}
                    >
                      {design.is_public ? <XCircle size={20} className="mr-2" /> : <CheckCircle size={20} className="mr-2" />}
                      {design.is_public ? 'Make Private' : 'Make Public'}
                    </button>
                    <button
                      onClick={() => handleDeleteDesign(design.id)}
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

export default AdminDesigns;
