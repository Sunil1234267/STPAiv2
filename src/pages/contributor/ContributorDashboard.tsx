import React, { useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, Upload, FileText, Users, Settings, MessageSquare } from 'lucide-react';
import ScrollReveal from '../../components/ScrollReveal';
import { supabase } from '../../supabaseClient';

interface ContributorDashboardProps {
  session: Session | null;
}

const ContributorDashboard: React.FC<ContributorDashboardProps> = ({ session }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkContributorRole = async () => {
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

        if (profileError || profileData?.role !== 'contributor') {
          navigate('/dashboard'); // Redirect if not a contributor
          return;
        }
        setLoading(false);
      } catch (err: any) {
        console.error('Error checking contributor role:', err.message);
        setError('Failed to verify contributor role. Please try again.');
        navigate('/dashboard'); // Redirect on error
      }
    };

    checkContributorRole();
  }, [session, navigate]);

  const contributorItems = [
    { name: 'Upload Designs', description: 'Submit your new textile designs for review.', icon: Upload, link: '/contributor/upload-design' },
    { name: 'My Submissions', description: 'View the status and feedback on your submitted designs.', icon: FileText, link: '/contributor/my-submissions' },
    { name: 'Chat with Admin', description: 'Communicate directly with administrators for support.', icon: MessageSquare, link: '/contributor/chat' },
    { name: 'Profile Settings', description: 'Manage your contributor profile and preferences.', icon: Settings, link: '/profile' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white flex items-center justify-center transition-colors duration-300">
        <div className="text-xl font-semibold text-blue-500 dark:text-blue-400">Loading contributor dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-red-500 dark:text-red-400 flex items-center justify-center p-4 transition-colors duration-300">
        <p className="text-xl font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-8">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            Contributor Dashboard
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            Tools and resources for managing your design contributions.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {contributorItems.map((item, index) => (
            <ScrollReveal key={item.name} delay={index * 100 + 200}>
              <div
                onClick={() => navigate(item.link)}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col items-center text-center cursor-pointer transform hover:scale-105 transition-all duration-300 border border-gray-200 dark:border-gray-700 h-[200px] justify-between"
              >
                <item.icon size={48} className="text-blue-600 dark:text-blue-400 mb-4" />
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  {item.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-sm flex-grow flex items-center justify-center">
                  {item.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContributorDashboard;
