import React, { useState, useEffect, useRef } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';
import { Send, Bot, User, Loader2, Sparkles, X, Pencil, Check } from 'lucide-react'; // Added Pencil and Check icons
import ScrollReveal from '../components/ScrollReveal';

interface ChatbotProps {
  session: Session | null;
}

interface Message {
  id: string;
  chat_box_id: string;
  sender: 'user' | 'bot';
  content: string;
  created_at: string;
}

interface ChatBox {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ session }) => {
  const [chatBoxes, setChatBoxes] = useState<ChatBox[]>([]);
  const [currentChatBox, setCurrentChatBox] = useState<ChatBox | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingChatBoxId, setEditingChatBoxId] = useState<string | null>(null);
  const [editingChatBoxName, setEditingChatBoxName] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (session) {
      fetchChatBoxes();
    } else {
      setLoading(false);
      setError('Please sign in to use the chatbot.');
    }
  }, [session]);

  useEffect(() => {
    if (currentChatBox) {
      fetchMessages(currentChatBox.id);
    } else {
      setMessages([]);
    }
  }, [currentChatBox]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChatBoxes = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('chat_boxes')
        .select('*')
        .eq('user_id', session?.user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChatBoxes(data || []);
      if (data && data.length > 0 && !currentChatBox) {
        setCurrentChatBox(data[0]);
      }
    } catch (err: any) {
      console.error('Error fetching chat boxes:', err.message);
      setError('Failed to load chat history.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatBoxId: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('chat_box_id', chatBoxId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (err: any) {
      console.error('Error fetching messages:', err.message);
      setError('Failed to load messages.');
    } finally {
      setLoading(false);
    }
  };

  const createNewChat = async () => {
    if (!session) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('chat_boxes')
        .insert({
          user_id: session.user.id,
          name: `New Chat ${new Date().toLocaleDateString()}`,
        })
        .select()
        .single();

      if (error) throw error;
      setChatBoxes(prev => [data, ...prev]);
      setCurrentChatBox(data);
      setMessages([]);
    } catch (err: any) {
      console.error('Error creating new chat:', err.message);
      setError('Failed to create new chat.');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !session || !currentChatBox || sendingMessage) return;

    setSendingMessage(true);
    setError(null);
    const userMessage: Message = {
      id: Date.now().toString(), // Temporary ID
      chat_box_id: currentChatBox.id,
      sender: 'user',
      content: newMessage.trim(),
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');

    try {
      // Save user message to DB
      const { error: userMsgError } = await supabase
        .from('messages')
        .insert(userMessage);
      if (userMsgError) throw userMsgError;

      // Simulate bot response
      const botResponseContent = `Echo: "${userMessage.content}". I'm an AI assistant, how can I help you with textile designs today?`;
      const botMessage: Message = {
        id: (Date.now() + 1).toString(), // Temporary ID
        chat_box_id: currentChatBox.id,
        sender: 'bot',
        content: botResponseContent,
        created_at: new Date().toISOString(),
      };

      // Save bot message to DB
      const { error: botMsgError } = await supabase
        .from('messages')
        .insert(botMessage);
      if (botMsgError) throw botMsgError;

      setMessages(prev => [...prev.filter(msg => msg.id !== userMessage.id), userMessage, botMessage]);
    } catch (err: any) {
      console.error('Error sending message:', err.message);
      setError('Failed to send message. Please try again.');
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id));
    } finally {
      setSendingMessage(false);
    }
  };

  const handleRenameChatBox = async (chatBoxId: string) => {
    if (!session || !editingChatBoxName.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('chat_boxes')
        .update({ name: editingChatBoxName.trim() })
        .eq('id', chatBoxId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setChatBoxes(prev =>
        prev.map(cb =>
          cb.id === chatBoxId ? { ...cb, name: editingChatBoxName.trim() } : cb
        )
      );
      if (currentChatBox?.id === chatBoxId) {
        setCurrentChatBox(prev => prev ? { ...prev, name: editingChatBoxName.trim() } : null);
      }
      setEditingChatBoxId(null);
      setEditingChatBoxName('');
    } catch (err: any) {
      console.error('Error renaming chat box:', err.message);
      setError('Failed to rename chat. You might not have permission.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChatBox = async (chatBoxId: string) => {
    if (!session) return;
    if (!window.confirm('Are you sure you want to delete this chat? All messages will be lost.')) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('chat_boxes')
        .delete()
        .eq('id', chatBoxId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      setChatBoxes(prev => prev.filter(cb => cb.id !== chatBoxId));
      if (currentChatBox?.id === chatBoxId) {
        setCurrentChatBox(chatBoxes.length > 1 ? chatBoxes[1] : null); // Switch to another chat or null
      }
      alert('Chat deleted successfully!');
    } catch (err: any) {
      console.error('Error deleting chat box:', err.message);
      setError('Failed to delete chat. You might not have permission.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 p-4">
      <div className="container mx-auto py-8 flex flex-col lg:flex-row h-[calc(100vh-150px)]">
        {/* Chat History Sidebar */}
        <ScrollReveal delay={0} className="w-full lg:w-1/4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 mb-6 lg:mb-0 lg:mr-6 flex flex-col border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center space-x-2">
            <Sparkles size={24} className="text-purple-600 dark:text-purple-400" />
            <span>Chat History</span>
          </h2>
          <button
            onClick={createNewChat}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md flex items-center justify-center space-x-2 mb-4 transition-colors duration-200"
            disabled={loading || !session}
          >
            <Sparkles size={20} />
            <span>New Chat</span>
          </button>
          <div className="flex-grow overflow-y-auto custom-scrollbar pr-2">
            {loading && <p className="text-blue-500 dark:text-blue-400 text-center">Loading chats...</p>}
            {error && <p className="text-red-500 dark:text-red-400 text-center">{error}</p>}
            {!loading && !error && chatBoxes.length === 0 && session && (
              <p className="text-gray-600 dark:text-gray-400 text-center">No chats yet. Start a new one!</p>
            )}
            {chatBoxes.map((chatBox) => (
              <div
                key={chatBox.id}
                className={`flex items-center justify-between p-3 rounded-md cursor-pointer mb-2 transition-colors duration-200 ${currentChatBox?.id === chatBox.id ? 'bg-blue-100 dark:bg-blue-700 text-blue-800 dark:text-white' : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-300'}`}
                onClick={() => setCurrentChatBox(chatBox)}
              >
                {editingChatBoxId === chatBox.id ? (
                  <input
                    type="text"
                    value={editingChatBoxName}
                    onChange={(e) => setEditingChatBoxName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleRenameChatBox(chatBox.id);
                      }
                      if (e.key === 'Escape') {
                        setEditingChatBoxId(null);
                        setEditingChatBoxName('');
                      }
                    }}
                    className="flex-grow p-1 rounded-sm bg-white dark:bg-gray-600 border border-blue-400 dark:border-blue-500 text-gray-900 dark:text-white focus:outline-none"
                    autoFocus
                    onClick={(e) => e.stopPropagation()} // Prevent selecting chatbox when clicking input
                  />
                ) : (
                  <span className="font-medium truncate">{chatBox.name}</span>
                )}
                <div className="flex items-center space-x-1 ml-2">
                  {editingChatBoxId === chatBox.id ? (
                    <>
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRenameChatBox(chatBox.id); }}
                        className="p-1 rounded-full hover:bg-green-200 dark:hover:bg-green-700 text-green-600 dark:text-green-300 transition-colors duration-200"
                        title="Save Rename"
                      >
                        <Check size={16} />
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setEditingChatBoxId(null); setEditingChatBoxName(''); }}
                        className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-700 text-red-600 dark:text-red-300 transition-colors duration-200"
                        title="Cancel Rename"
                      >
                        <X size={16} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingChatBoxId(chatBox.id);
                        setEditingChatBoxName(chatBox.name);
                      }}
                      className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 transition-colors duration-200"
                      title="Rename Chat"
                    >
                      <Pencil size={16} />
                    </button>
                  )}
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteChatBox(chatBox.id); }}
                    className="p-1 rounded-full hover:bg-red-200 dark:hover:bg-red-700 text-red-600 dark:text-red-300 transition-colors duration-200"
                    title="Delete Chat"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Chat Window */}
        <ScrollReveal delay={100} className="w-full lg:w-3/4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 flex flex-col border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 border-b pb-4 border-gray-200 dark:border-gray-700">
            {currentChatBox ? currentChatBox.name : 'Select a Chat or Start New'}
          </h2>

          <div className="flex-grow overflow-y-auto custom-scrollbar p-2 space-y-4">
            {!session ? (
              <p className="text-center text-gray-600 dark:text-gray-400">Please sign in to use the chatbot.</p>
            ) : !currentChatBox ? (
              <p className="text-center text-gray-600 dark:text-gray-400">Start a new chat to begin your conversation with the AI assistant.</p>
            ) : (
              messages.map((msg, index) => (
                <div
                  key={msg.id}
                  className={`flex items-start ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'bot' && (
                    <Bot size={24} className="text-blue-600 dark:text-blue-400 mr-3 flex-shrink-0" />
                  )}
                  <div className={`p-3 rounded-lg max-w-[70%] ${msg.sender === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none'}`}>
                    <p className="text-sm">{msg.content}</p>
                    <span className="block text-right text-xs opacity-75 mt-1">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  {msg.sender === 'user' && (
                    <User size={24} className="text-green-600 dark:text-green-400 ml-3 flex-shrink-0" />
                  )}
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {currentChatBox && (
            <form onSubmit={sendMessage} className="mt-4 flex items-center space-x-3 border-t pt-4 border-gray-200 dark:border-gray-700">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow p-3 rounded-md bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={sendingMessage || loading}
              />
              <button
                type="submit"
                className={`bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-md transition-colors duration-200 ${sendingMessage || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={sendingMessage || loading}
              >
                {sendingMessage ? <Loader2 size={24} className="animate-spin" /> : <Send size={24} />}
              </button>
            </form>
          )}
        </ScrollReveal>
      </div>
    </div>
  );
};

export default Chatbot;
