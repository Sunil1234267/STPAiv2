import React from 'react';
import { Link } from 'react-router-dom'; // Import Link
import { Sparkles, Palette, Layers, MessageSquare, ShoppingBag, Save, User, Shield, TrendingUp, Settings, Globe, Code, Zap, ArrowRight } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';

const Features: React.FC = () => {
  const featureCategories = [
    {
      name: 'Core AI Design',
      icon: Sparkles,
      features: [
        { title: 'AI Design Generation', description: 'Generate unique and intricate textile patterns using advanced AI algorithms based on text prompts or image inputs.' },
        { title: 'Style Transfer', description: 'Apply the artistic style from one image to your textile designs, creating new and innovative looks.' },
        { title: 'Color Palette Generation', description: 'Automatically suggest harmonious color palettes for your designs, or extract palettes from existing images.' },
        { title: 'Seamless Pattern Creation', description: 'Ensure your generated designs are perfectly tileable for continuous fabric printing.' },
      ],
    },
    {
      name: 'Design Management',
      icon: Palette,
      features: [
        { title: 'Design Library', description: 'Store, organize, and search all your generated and uploaded designs in a centralized, cloud-based library.' },
        { title: 'Collection Management', description: 'Group related designs into cohesive collections for presentations, seasonal lines, or project organization.' },
        { title: 'Version Control', description: 'Track changes and revert to previous versions of your designs, ensuring no creative idea is ever lost.' },
        { title: 'Tagging & Categorization', description: 'Easily find designs using custom tags, categories, and smart search filters.' },
      ],
    },
    {
      name: 'Collaboration & Workflow',
      icon: Layers,
      features: [
        { title: 'Team Collaboration', description: 'Share designs and collections with team members, gather feedback, and work together in real-time.' },
        { title: 'Client Sharing', description: 'Create shareable links for clients to view designs, leave comments, and approve selections securely.' },
        { title: 'Order Management Integration', description: 'Seamlessly transition approved designs into production orders with integrated tracking.' },
        { title: 'Export Options', description: 'Export designs in various formats (e.g., JPEG, PNG, TIFF) suitable for printing and digital use.' },
      ],
    },
    {
      name: 'Intelligent Assistance',
      icon: MessageSquare,
      features: [
        { title: 'AI Chatbot Assistant', description: 'Get instant answers to design questions, creative suggestions, and technical support from our intelligent chatbot.' },
        { title: 'Trend Analysis', description: 'Receive AI-driven insights into current and emerging textile design trends to inform your creations.' },
        { title: 'Material Compatibility Suggestions', description: 'Get recommendations on suitable fabric types and printing methods for your designs.' },
        { title: 'Design Optimization Tips', description: 'AI suggestions to optimize your designs for better print quality, color accuracy, and cost efficiency.' },
      ],
    },
    {
      name: 'Account & Security',
      icon: Shield,
      features: [
        { title: 'User Profiles', description: 'Personalized dashboards and profile settings to manage your account and preferences.' },
        { title: 'Role-Based Access Control', description: 'Define user roles (e.g., designer, manager, admin) with specific permissions for secure team operations.' },
        { title: 'Data Encryption', description: 'All your design data and personal information are secured with industry-standard encryption.' },
        { title: 'Secure Authentication', description: 'Robust user authentication system to protect your account from unauthorized access.' },
      ],
    },
    {
      name: 'Advanced & Enterprise',
      icon: TrendingUp,
      features: [
        { title: 'Custom AI Model Training', description: 'Train a private AI model on your brand\'s specific design archives for highly personalized outputs.' },
        { title: 'API Access', description: 'Integrate SunilTextile.AI capabilities directly into your existing design software or ERP systems.' },
        { title: 'Dedicated Support', description: 'Receive priority support with a dedicated account manager for enterprise-level needs.' },
        { title: 'On-Premise Deployment Options', description: 'For maximum security and control, deploy our solution within your own infrastructure.' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-12">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            Our Powerful Features
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            Everything you need to revolutionize your textile design process.
          </p>
        </ScrollReveal>

        <div className="space-y-16">
          {featureCategories.map((category, catIndex) => (
            <section key={catIndex} className="mb-12">
              <ScrollReveal delay={catIndex * 100 + 200}>
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-8 flex items-center justify-center space-x-3">
                  <category.icon size={36} className="text-blue-600 dark:text-blue-400" />
                  <span>{category.name}</span>
                </h2>
              </ScrollReveal>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {category.features.map((feature, featIndex) => (
                  <ScrollReveal key={featIndex} delay={(catIndex * 100) + (featIndex * 50) + 300}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-all duration-300">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3 flex items-center space-x-2">
                        <Zap size={20} className="text-green-600 dark:text-green-400" />
                        <span>{feature.title}</span>
                      </h3>
                      <p className="text-gray-700 dark:text-gray-300 text-sm">
                        {feature.description}
                      </p>
                    </div>
                  </ScrollReveal>
                ))}
              </div>
            </section>
          ))}
        </div>

        <section className="mt-20 text-center">
          <ScrollReveal delay={1000}>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
              Ready to Transform Your Design Process?
            </h2>
          </ScrollReveal>
          <ScrollReveal delay={1100}>
            <Link // Changed from <a> to Link
              to="/pricing" // Changed href to to
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg transform hover:scale-105 transition-all duration-300"
            >
              <span>Explore Our Plans</span>
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </ScrollReveal>
        </section>
      </div>
    </div>
  );
};

export default Features;
