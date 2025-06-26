import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Heart, Image as ImageIcon, FileText, X, Trash2 } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal'; // Import ScrollReveal

interface SavedContentProps {
  session: Session | null;
}

interface SavedItem {
  id: string;
  user_id: string;
  item_type: 'design' | 'article';
  item_id: string;
  created_at: string;
  design_data?: {
    id: string;
    title: string;
    description: string;
    image_url: string;
  };
  article_data?: {
    id: string;
    title: string;
    content: string;
    image_url: string;
  };
}

const SavedContent: React.FC<SavedContentProps> = ({ session }) => {
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) {
      fetchSavedItems();
    } else {
      setLoading(false);
      setError('Please sign in to view your saved content.');
    }
  }, [session]);

  const fetchSavedItems = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .select(`
          id,
          user_id,
          item_type,
          item_id,
          created_at,
          designs (
            id,
            title,
            description,
            image_url
          ),
          articles (
            id,
            title,
            content,
            image_url
          )
        `)
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedItems: SavedItem[] = data.map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        item_type: item.item_type,
        item_id: item.item_id,
        created_at: item.created_at,
        design_data: item.designs,
        article_data: item.articles,
      }));
      setSavedItems(formattedItems);
    } catch (err: any) {
      console.error('Error fetching saved items:', err.message);
      setError('Failed to load saved content. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSavedItem = async (savedItemId: string) => {
    if (!session) return;
    if (!window.confirm('Are you sure you want to remove this item from your saved list?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('saved_items')
        .delete()
        .eq('id', savedItemId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setSavedItems(prev => prev.filter(item => item.id !== savedItemId));
      alert('Item removed from saved content.');
    } catch (err: any) {
      console.error('Error deleting saved item:', err.message);
      setError('Failed to remove item. You might not have permission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-8">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            Your Saved Content
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            Access your favorite designs, articles, and resources here.
          </p>
        </ScrollReveal>

        {loading && (
          <div className="text-center py-8">
            <p className="text-blue-500 dark:text-blue-400">Loading saved content...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500 dark:text-red-400">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && savedItems.length === 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>You haven't saved any content yet.</p>
            <p className="mt-2">Explore designs or articles to save them here!</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {savedItems.map((item, index) => (
            <ScrollReveal key={item.id} delay={index * 100 + 200}> {/* Staggered delay */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
                {item.item_type === 'design' && item.design_data && (
                  <>
                    <img src={item.design_data.image_url} alt={item.design_data.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                        <ImageIcon size={20} className="mr-2 text-blue-600 dark:text-blue-400" />
                        {item.design_data.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                        {item.design_data.description}
                      </p>
                    </div>
                  </>
                )}
                {item.item_type === 'article' && item.article_data && (
                  <>
                    {item.article_data.image_url && (
                      <img src={item.article_data.image_url} alt={item.article_data.title} className="w-full h-48 object-cover" />
                    )}
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 flex items-center">
                        <FileText size={20} className="mr-2 text-green-600 dark:text-green-400" />
                        {item.article_data.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-3">
                        {item.article_data.content.substring(0, 150)}...
                      </p>
                    </div>
                  </>
                )}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Saved on: {new Date(item.created_at).toLocaleDateString()}
                  </span>
                  <button
                    onClick={() => handleDeleteSavedItem(item.id)}
                    className="p-2 rounded-full bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 transition-colors duration-200"
                    title="Remove from saved"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SavedContent;
