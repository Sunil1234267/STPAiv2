import React from 'react';
import { CheckCircle, XCircle, DollarSign, Sparkles, Layers, MessageSquare, Shield, TrendingUp } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal'; // Import ScrollReveal

const Pricing: React.FC = () => {
  const plans = [
    {
      name: 'Free Tier',
      price: '0',
      period: '/month',
      description: 'Perfect for hobbyists and exploring AI design.',
      features: [
        { text: '5 AI Design Generations/month', included: true },
        { text: 'Basic Collection Management', included: true },
        { text: 'Limited Chatbot Interactions', included: true },
        { text: 'Public Designs Only', included: true },
        { text: 'Community Support', included: true },
        { text: 'No Order Management', included: false },
        { text: 'No Admin Access', included: false },
        { text: 'No Priority Support', included: false },
      ],
      buttonText: 'Get Started Free',
      buttonLink: '/auth',
      highlight: false,
    },
    {
      name: 'Pro Designer',
      price: '29',
      period: '/month',
      description: 'For professional designers and small studios.',
      features: [
        { text: 'Unlimited AI Design Generations', included: true },
        { text: 'Advanced Collection Management', included: true },
        { text: 'Unlimited Chatbot Interactions', included: true },
        { text: 'Private & Public Designs', included: true },
        { text: 'Email & Chat Support', included: true },
        { text: 'Basic Order Management', included: true },
        { text: 'Access to Beta Features', included: true },
        { text: 'No Admin Access', included: false },
      ],
      buttonText: 'Choose Pro',
      buttonLink: '/auth',
      highlight: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: '',
      description: 'Tailored solutions for large businesses and agencies.',
      features: [
        { text: 'All Pro Designer Features', included: true },
        { text: 'Dedicated Account Manager', included: true },
        { text: 'Custom AI Model Training', included: true },
        { text: 'API Access & Integrations', included: true },
        { text: 'Priority 24/7 Support', included: true },
        { text: 'Advanced Order Management', included: true },
        { text: 'Admin Access & Analytics', included: true },
        { text: 'On-site Training & Workshops', included: true },
      ],
      buttonText: 'Contact Sales',
      buttonLink: '/contact',
      highlight: false,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-12">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            Flexible Pricing Plans
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            Choose the plan that best fits your creative and business needs.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan, index) => (
            <ScrollReveal key={plan.name} delay={index * 150 + 200}> {/* Staggered delay */}
              <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 flex flex-col h-full transform hover:scale-105 transition-all duration-300 border ${plan.highlight ? 'border-blue-600 dark:border-blue-400 ring-4 ring-blue-200 dark:ring-blue-700' : 'border-gray-200 dark:border-gray-700'}`}>
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1 rounded-full shadow-md">
                    Most Popular
                  </div>
                )}
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4 text-center">
                  {plan.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6 flex-grow">
                  {plan.description}
                </p>
                <div className="text-center mb-8">
                  {plan.price === 'Custom' ? (
                    <span className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">
                      {plan.price}
                    </span>
                  ) : (
                    <span className="text-5xl font-extrabold text-blue-600 dark:text-blue-400">
                      <DollarSign size={40} className="inline-block align-middle mr-1" />
                      {plan.price}
                    </span>
                  )}
                  <span className="text-xl font-medium text-gray-600 dark:text-gray-400">
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-3 mb-8 flex-grow">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-700 dark:text-gray-300">
                      {feature.included ? (
                        <CheckCircle size={20} className="text-green-500 mr-3 flex-shrink-0" />
                      ) : (
                        <XCircle size={20} className="text-red-500 mr-3 flex-shrink-0" />
                      )}
                      <span>{feature.text}</span>
                    </li>
                  ))}
                </ul>
                <a
                  href={plan.buttonLink}
                  className={`mt-auto block text-center py-3 px-6 rounded-full font-bold text-lg transition-all duration-300 ${plan.highlight ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg transform hover:scale-105' : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white'}`}
                >
                  {plan.buttonText}
                </a>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <section className="mt-20 text-center">
          <ScrollReveal delay={700}>
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">
              Why Choose SunilTextile.AI?
            </h2>
          </ScrollReveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            <ScrollReveal delay={800}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <Sparkles size={48} className="text-purple-600 dark:text-purple-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">AI-Powered Creativity</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Generate unique designs in seconds, fueled by advanced AI.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={900}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <Layers size={48} className="text-green-600 dark:text-green-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Seamless Workflow</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Manage designs, collections, and orders all in one place.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={1000}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <MessageSquare size={48} className="text-orange-600 dark:text-orange-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Instant Support</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Get quick answers and creative ideas from our intelligent chatbot.
                </p>
              </div>
            </ScrollReveal>
            <ScrollReveal delay={1100}>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
                <TrendingUp size={48} className="text-blue-600 dark:text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Grow Your Business</h3>
                <p className="text-gray-700 dark:text-gray-300 text-sm">
                  Scale your operations and reach new markets with ease.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Pricing;
