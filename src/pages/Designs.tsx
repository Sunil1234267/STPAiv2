import React, { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { PlusCircle, Search, Filter, X, Image as ImageIcon, Download, Share2, Heart, MessageSquare, Edit, Trash2 } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal'; // Import ScrollReveal

interface DesignsProps {
  session: Session | null;
  userRole: string | null;
}

interface Design {
  id: string;
  user_id: string;
  title: string;
  description: string;
  image_url: string;
  created_at: string;
  is_public: boolean;
  tags: string[];
}

const Designs: React.FC<DesignsProps> = ({ session, userRole }) => {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDesign, setCurrentDesign] = useState<Design | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newDesignTitle, setNewDesignTitle] = useState('');
  const [newDesignDescription, setNewDesignDescription] = useState('');
  const [newDesignTags, setNewDesignTags] = useState('');
  const [newDesignPublic, setNewDesignPublic] = useState(false);
  const [newDesignPrompt, setNewDesignPrompt] = useState('');

  useEffect(() => {
    fetchDesigns();
  }, [session]);

  const fetchDesigns = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase.from('designs').select('*');

      if (session) {
        // Authenticated users see their own designs and public designs
        query = query.or(`user_id.eq.${session.user.id},is_public.eq.true`);
      } else {
        // Unauthenticated users only see public designs
        query = query.eq('is_public', true);
      }

      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }
      if (filterTag) {
        query = query.contains('tags', [filterTag]);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setDesigns(data || []);
    } catch (err: any) {
      console.error('Error fetching designs:', err.message);
      setError('Failed to load designs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateDesign = async () => {
    if (!session) {
      alert('Please sign in to generate designs.');
      return;
    }
    if (!newDesignPrompt || !newDesignTitle) {
      alert('Please provide a prompt and title for your new design.');
      return;
    }

    setIsGenerating(true);
    setError(null);
    try {
      // Simulate AI generation and image upload
      const imageUrl = `https://picsum.photos/seed/${Date.now()}/800/600`; // Placeholder image
      const tagsArray = newDesignTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      const { data, error } = await supabase
        .from('designs')
        .insert({
          user_id: session.user.id,
          title: newDesignTitle,
          description: newDesignDescription,
          image_url: imageUrl,
          is_public: newDesignPublic,
          tags: tagsArray,
        })
        .select()
        .single();

      if (error) throw error;

      setDesigns(prev => [data, ...prev]);
      setIsModalOpen(false);
      setNewDesignTitle('');
      setNewDesignDescription('');
      setNewDesignTags('');
      setNewDesignPublic(false);
      setNewDesignPrompt('');
      alert('Design generated and saved successfully!');
    } catch (err: any) {
      console.error('Error generating design:', err.message);
      setError('Failed to generate design. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEditDesign = (design: Design) => {
    setCurrentDesign(design);
    setNewDesignTitle(design.title);
    setNewDesignDescription(design.description);
    setNewDesignTags(design.tags.join(', '));
    setNewDesignPublic(design.is_public);
    setIsModalOpen(true);
  };

  const handleUpdateDesign = async () => {
    if (!currentDesign || !session) return;

    setIsGenerating(true); // Reusing for update loading state
    setError(null);
    try {
      const tagsArray = newDesignTags.split(',').map(tag => tag.trim()).filter(tag => tag !== '');

      const { error } = await supabase
        .from('designs')
        .update({
          title: newDesignTitle,
          description: newDesignDescription,
          is_public: newDesignPublic,
          tags: tagsArray,
        })
        .eq('id', currentDesign.id)
        .eq('user_id', session.user.id); // Ensure only owner can update

      if (error) throw error;

      setDesigns(prev => prev.map(d => d.id === currentDesign.id ? { ...d, title: newDesignTitle, description: newDesignDescription, is_public: newDesignPublic, tags: tagsArray } : d));
      setIsModalOpen(false);
      setCurrentDesign(null);
      setNewDesignTitle('');
      setNewDesignDescription('');
      setNewDesignTags('');
      setNewDesignPublic(false);
      alert('Design updated successfully!');
    } catch (err: any) {
      console.error('Error updating design:', err.message);
      setError('Failed to update design. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteDesign = async (designId: string) => {
    if (!session) {
      alert('You must be signed in to delete designs.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this design?')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('designs')
        .delete()
        .eq('id', designId)
        .eq('user_id', session.user.id); // Ensure only owner can delete

      if (error) throw error;

      setDesigns(prev => prev.filter(d => d.id !== designId));
      alert('Design deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting design:', err.message);
      setError('Failed to delete design. You might not have permission.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveContent = async (designId: string) => {
    if (!session) {
      alert('Please sign in to save content.');
      return;
    }
    try {
      const { data, error } = await supabase
        .from('saved_items')
        .insert({
          user_id: session.user.id,
          item_type: 'design',
          item_id: designId,
        });

      if (error) {
        if (error.code === '23505') { // Unique violation code
          alert('This design is already saved!');
        } else {
          throw error;
        }
      } else {
        alert('Design saved to your collection!');
      }
    } catch (err: any) {
      console.error('Error saving content:', err.message);
      setError('Failed to save design.');
    }
  };

  const allTags = Array.from(new Set(designs.flatMap(d => d.tags)));

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-8">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            Explore Textile Designs
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            Discover unique AI-generated patterns or create your own.
          </p>
        </ScrollReveal>

        {session && (
          <ScrollReveal delay={200}>
            <div className="flex justify-center mb-8">
              <button
                onClick={() => { setIsModalOpen(true); setCurrentDesign(null); setNewDesignTitle(''); setNewDesignDescription(''); setNewDesignTags(''); setNewDesignPublic(false); setNewDesignPrompt(''); }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-full flex items-center space-x-2 shadow-lg transform hover:scale-105 transition-all duration-300"
              >
                <PlusCircle size={24} />
                <span>Generate New Design</span>
              </button>
            </div>
          </ScrollReveal>
        )}

        <ScrollReveal delay={300}>
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <input
                type="text"
                placeholder="Search designs by title..."
                className="w-full p-3 pl-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') fetchDesigns(); }}
              />
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
            <div className="relative">
              <select
                className="w-full md:w-48 p-3 pl-10 rounded-lg bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filterTag}
                onChange={(e) => setFilterTag(e.target.value)}
              >
                <option value="">All Tags</option>
                {allTags.map(tag => (
                  <option key={tag} value={tag}>{tag}</option>
                ))}
              </select>
              <Filter size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-300">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
            <button
              onClick={fetchDesigns}
              className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-white font-bold py-3 px-6 rounded-lg shadow-md transition-colors duration-200"
            >
              Apply Filters
            </button>
          </div>
        </ScrollReveal>

        {loading && (
          <div className="text-center py-8">
            <p className="text-blue-500 dark:text-blue-400">Loading designs...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-8 text-red-500 dark:text-red-400">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && designs.length === 0 && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            <p>No designs found. Try adjusting your search or filters.</p>
            {session && (
              <button
                onClick={() => { setIsModalOpen(true); setCurrentDesign(null); }}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full flex items-center space-x-2 mx-auto"
              >
                <PlusCircle size={20} />
                <span>Generate Your First Design</span>
              </button>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {designs.map((design, index) => (
            <ScrollReveal key={design.id} delay={index * 100 + 400}> {/* Staggered delay */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700">
                <img src={design.image_url} alt={design.title} className="w-full h-48 object-cover" />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">{design.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{design.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {design.tags.map(tag => (
                      <span key={tag} className="bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleSaveContent(design.id)}
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        title="Save Design"
                      >
                        <Heart size={18} />
                      </button>
                      <button
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        title="Download Image"
                      >
                        <Download size={18} />
                      </button>
                      <button
                        className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200"
                        title="Share Design"
                      >
                        <Share2 size={18} />
                      </button>
                    </div>
                    {session && session.user.id === design.user_id && (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditDesign(design)}
                          className="p-2 rounded-full bg-yellow-100 dark:bg-yellow-800 text-yellow-800 dark:text-yellow-200 hover:bg-yellow-200 dark:hover:bg-yellow-700 transition-colors duration-200"
                          title="Edit Design"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteDesign(design.id)}
                          className="p-2 rounded-full bg-red-100 dark:bg-red-800 text-red-800 dark:text-red-200 hover:bg-red-200 dark:hover:bg-red-700 transition-colors duration-200"
                          title="Delete Design"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Design Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl relative transform transition-all duration-300 scale-100 opacity-100">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
              {currentDesign ? 'Edit Design' : 'Generate New Design'}
            </h2>
            <div className="space-y-4">
              {!currentDesign && (
                <div>
                  <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    AI Generation Prompt
                  </label>
                  <textarea
                    id="prompt"
                    rows={3}
                    className="w-full p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 'Floral pattern with vibrant colors, seamless, for silk fabric'"
                    value={newDesignPrompt}
                    onChange={(e) => setNewDesignPrompt(e.target.value)}
                    disabled={isGenerating}
                  ></textarea>
                </div>
              )}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="w-full p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome Design"
                  value={newDesignTitle}
                  onChange={(e) => setNewDesignTitle(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={2}
                  className="w-full p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="A brief description of your design..."
                  value={newDesignDescription}
                  onChange={(e) => setNewDesignDescription(e.target.value)}
                  disabled={isGenerating}
                ></textarea>
              </div>
              <div>
                <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  id="tags"
                  className="w-full p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="floral, abstract, modern"
                  value={newDesignTags}
                  onChange={(e) => setNewDesignTags(e.target.value)}
                  disabled={isGenerating}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPublic"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                  checked={newDesignPublic}
                  onChange={(e) => setNewDesignPublic(e.target.checked)}
                  disabled={isGenerating}
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                  Make Public (visible to everyone)
                </label>
              </div>
              <button
                onClick={currentDesign ? handleUpdateDesign : handleGenerateDesign}
                className={`w-full py-3 rounded-md font-bold text-white flex items-center justify-center space-x-2 transition-colors duration-200 ${isGenerating ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>{currentDesign ? 'Updating...' : 'Generating...'}</span>
                  </>
                ) : (
                  <>
                    <ImageIcon size={20} />
                    <span>{currentDesign ? 'Update Design' : 'Generate & Save Design'}</span>
                  </>
                )}
              </button>
              {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Designs;
