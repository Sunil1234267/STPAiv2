import React, { useState, useEffect } from 'react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import { supabase } from '../supabaseClient';

// Define the form data type
interface ContactFormData {
  ticket_number: string;
  name: string;
  email: string;
  subject: string;
  message: string;
}

const Contact: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    ticket_number: '',
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [responseMessage, setResponseMessage] = useState<string | null>(null);

  // Auto-fill user data if logged in
  useEffect(() => {
    const fetchUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const userId = session.user.id;
        // Fetch profile for name/email
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('id', userId)
          .single();
        setFormData(prev => ({
          ...prev,
          name: profile?.full_name || '',
          email: profile?.email || '',
        }));
      }
    };
    fetchUser();
  }, []);

  // Generate a unique 5-digit ticket number
  const generateTicketNumber = () => {
    return Math.floor(10000 + Math.random() * 90000).toString();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setResponseMessage(null);
    let ticketNumber = generateTicketNumber();
    // Ensure uniqueness (basic, not 100% collision-proof)
    let isUnique = false;
    for (let i = 0; i < 5 && !isUnique; i++) {
      const { data } = await supabase
        .from('public_queries')
        .select('ticket_number')
        .eq('ticket_number', ticketNumber);
      if (!data || data.length === 0) {
        isUnique = true;
      } else {
        ticketNumber = generateTicketNumber();
      }
    }
    if (!isUnique) {
      setStatus('error');
      setResponseMessage('Failed to generate a unique ticket number. Please try again.');
      return;
    }
    try {
      const { error } = await supabase
        .from('public_queries')
        .insert({
          ticket_number: ticketNumber,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
        });
      if (error) throw error;
      setStatus('success');
      setResponseMessage(`Your message has been sent! Your ticket number is: ${ticketNumber}`);
      setFormData({ ticket_number: '', name: '', email: '', subject: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setResponseMessage('Failed to send your message. Please try again later.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-12">
        <ScrollReveal delay={0}>
          <h1 className="text-4xl font-extrabold text-center mb-6 text-gray-800 dark:text-white">
            Get in Touch
          </h1>
        </ScrollReveal>
        <ScrollReveal delay={100}>
          <p className="text-xl text-center mb-12 text-gray-700 dark:text-gray-300">
            We'd love to hear from you! Reach out to us for any inquiries or support.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <ScrollReveal delay={200}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Mail size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Email Us</h3>
                    <p className="text-gray-700 dark:text-gray-300">support@suniltextile.ai</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <Phone size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Call Us</h3>
                    <p className="text-gray-700 dark:text-gray-300">+1 (555) 123-4567</p>
                  </div>
                </div>
                <div className="flex items-start space-x-4">
                  <MapPin size={24} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Our Office</h3>
                    <p className="text-gray-700 dark:text-gray-300">
                      123 Design Street, Textile City, TX 78901, USA
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Business Hours</h3>
                <p className="text-gray-700 dark:text-gray-300">Monday - Friday: 9:00 AM - 5:00 PM (EST)</p>
                <p className="text-gray-700 dark:text-gray-300">Saturday, Sunday: Closed</p>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={300}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 border border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                Send Us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    disabled={status === 'submitting'}
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={status === 'submitting'}
                  />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="w-full p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Inquiry about AI Designs"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    disabled={status === 'submitting'}
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Your Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    className="w-full p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Type your message here..."
                    value={formData.message}
                    onChange={handleChange}
                    required
                    disabled={status === 'submitting'}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className={`w-full py-3 rounded-md font-bold text-white flex items-center justify-center space-x-2 transition-colors duration-200 ${status === 'submitting' ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  disabled={status === 'submitting'}
                >
                  {status === 'submitting' ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
                {responseMessage && (
                  <p className={`mt-4 text-center ${status === 'success' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {responseMessage}
                  </p>
                )}
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
};

export default Contact;
