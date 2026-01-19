'use client';

import { useState, useEffect, FormEvent } from 'react';

type Tab = 'test' | 'subscribers' | 'newsletter';

interface Subscriber {
  _id: string;
  email: string;
  subscribedAt: string;
  unsubscribed?: boolean;
  unsubscribedAt?: string;
  lastEmailSentAt?: string;
  lastOpenedAt?: string;
}

interface NewsletterTemplate {
  name: string;
  content: string;
}

const NEWSLETTER_TEMPLATES: NewsletterTemplate[] = [
  {
    name: 'New Blog Post',
    content: `Hi there!\n\nI just published a new blog post that I think you'll enjoy.\n\n[Post Title]\n[Post Description]\n\nRead more: [Post Link]\n\nBest,\nSoham`
  },
  {
    name: 'Weekly Update',
    content: `Hey!\n\nHere's what I've been up to this week:\n\n- [Highlight 1]\n- [Highlight 2]\n- [Highlight 3]\n\nCheck out my latest post: [Link]\n\nThanks for reading!\nSoham`
  },
  {
    name: 'Monthly Roundup',
    content: `Hi everyone!\n\nHere's a roundup of everything from this month:\n\n[Summary of posts and updates]\n\nTop posts this month:\n1. [Post 1]\n2. [Post 2]\n3. [Post 3]\n\nSee you next month!\nSoham`
  },
  {
    name: 'Custom',
    content: ''
  }
];

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');
  const [loginMessage, setLoginMessage] = useState('');
  const [activeTab, setActiveTab] = useState<Tab>('test');
  const [testResult, setTestResult] = useState('');
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [newsletterSubject, setNewsletterSubject] = useState('');
  const [newsletterHtml, setNewsletterHtml] = useState('');
  const [newsletterContent, setNewsletterContent] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('Custom');
  const [sendStatus, setSendStatus] = useState('');
  const [sending, setSending] = useState(false);

  // Check if already logged in (token in cookie)
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/admin/test-db');
        if (res.ok) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        // Not logged in
      }
    };
    checkAuth();
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoginMessage('Logging in...');
    
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setIsLoggedIn(true);
        setLoginMessage('Login successful!');
        setPassword('');
      } else {
        setLoginMessage(data.message || 'Login failed');
      }
    } catch (error) {
      setLoginMessage('Network error. Please try again.');
    }
  };

  const handleTestDB = async () => {
    setTestResult('Testing connection...');
    try {
      const res = await fetch('/api/admin/test-db');
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setTestResult('Error: ' + String(error));
    }
  };

  const fetchSubscribers = async () => {
    setSubscribersLoading(true);
    try {
      const res = await fetch('/api/admin/subscribers');
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers);
      } else {
        alert('Failed to fetch subscribers: ' + data.message);
      }
    } catch (error) {
      alert('Error fetching subscribers: ' + String(error));
    } finally {
      setSubscribersLoading(false);
    }
  };

  const handleDeleteSubscriber = async (id: string, email: string) => {
    if (!confirm(`Are you sure you want to delete subscriber "${email}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const res = await fetch('/api/admin/subscribers', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        // Remove the subscriber from the local state
        setSubscribers(subscribers.filter(sub => sub._id !== id));
        alert('Subscriber deleted successfully');
      } else {
        alert('Failed to delete subscriber: ' + data.message);
      }
    } catch (error) {
      alert('Error deleting subscriber: ' + String(error));
    }
  };

  const handleSendNewsletter = async () => {
    if (!newsletterSubject.trim() || !newsletterContent.trim()) {
      setSendStatus('Please fill in both subject and content');
      return;
    }
    
    setSending(true);
    setSendStatus('Sending newsletter...');
    
    // Convert plain text to HTML (preserve line breaks and paragraphs)
    const htmlContent = newsletterContent
      .split('\n\n')
      .map(paragraph => `<p>${paragraph.replace(/\n/g, '<br>')}</p>`)
      .join('');
    
    try {
      const res = await fetch('/api/admin/send-newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: newsletterSubject,
          html: htmlContent,
          segment: 'all',
        }),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setSendStatus(`Newsletter sent successfully! Sent: ${data.sent}, Failed: ${data.failed}, Total: ${data.total}`);
        setNewsletterSubject('');
        setNewsletterContent('');
        setSelectedTemplate('Custom');
      } else {
        setSendStatus('Error: ' + (data.message || 'Unknown error'));
      }
    } catch (error) {
      setSendStatus('Network error: ' + String(error));
    } finally {
      setSending(false);
    }
  };

  const handleLogout = async () => {
    try {
      // Clear the token cookie by calling a logout endpoint or just reload
      document.cookie = 'token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      setIsLoggedIn(false);
      setPassword('');
      setLoginMessage('');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleTemplateChange = (templateName: string) => {
    setSelectedTemplate(templateName);
    const template = NEWSLETTER_TEMPLATES.find(t => t.name === templateName);
    if (template) {
      setNewsletterContent(template.content);
    }
  };

  // If not logged in, show login form
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a] px-4">
        <div className="max-w-md w-full bg-[#1a1a1a] rounded-lg shadow-lg p-6 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center text-gray-100">Admin Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#3d4754] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <button
              type="submit"
              className="w-full px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Login
            </button>
            {loginMessage && (
              <p className={`text-sm text-center ${loginMessage.includes('successful') ? 'text-green-400' : 'text-red-400'}`}>
                {loginMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    );
  }

  // If logged in, show admin dashboard
  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-8 gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 tracking-tight">Admin Dashboard</h1>
            <p className="text-gray-400 text-xs sm:text-sm">Manage your blog and subscribers</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg shadow-red-900/30 hover:shadow-red-900/50"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 sm:mb-8 bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl p-2 overflow-x-auto">
          <nav className="flex space-x-2 min-w-max sm:min-w-0">
            <button
              onClick={() => setActiveTab('test')}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === 'test'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-[#252525]'
              }`}
            >
              Test Functions
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === 'subscribers'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-[#252525]'
              }`}
            >
              Subscribers
            </button>
            <button
              onClick={() => setActiveTab('newsletter')}
              className={`flex-1 py-2.5 sm:py-3 px-3 sm:px-4 font-medium text-xs sm:text-sm rounded-lg transition-all duration-200 whitespace-nowrap ${
                activeTab === 'newsletter'
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 text-white shadow-lg shadow-emerald-900/30'
                  : 'text-gray-400 hover:text-gray-300 hover:bg-[#252525]'
              }`}
            >
              Send Newsletter
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-[#1a1a1a] rounded-xl border border-gray-800 shadow-2xl overflow-hidden">
          {activeTab === 'test' && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center mr-3 sm:mr-4 shadow-lg shadow-emerald-900/30 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">Test Database Connection</h2>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Verify MongoDB connection status</p>
                </div>
              </div>
              
              <button
                onClick={handleTestDB}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50"
              >
                Test DB Connection
              </button>
              
              {testResult && (
                <div className="mt-6 bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 sm:p-6 shadow-inner">
                  <div className="flex items-center mb-3">
                    <span className="text-emerald-400 font-medium text-xs sm:text-sm">Response:</span>
                  </div>
                  <pre className="text-xs sm:text-sm overflow-x-auto text-gray-300 leading-relaxed font-mono">
                    {testResult}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'subscribers' && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center mr-3 sm:mr-4 shadow-lg shadow-emerald-900/30 flex-shrink-0">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">Subscribers</h2>
                    <p className="text-gray-400 text-xs sm:text-sm mt-1">View and manage newsletter subscribers</p>
                  </div>
                </div>
                <button
                  onClick={fetchSubscribers}
                  disabled={subscribersLoading}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {subscribersLoading ? 'Loading...' : 'Fetch Subscribers'}
                </button>
              </div>
              
              {subscribers.length > 0 ? (
                <div className="mt-6">
                  {/* Desktop Table View */}
                  <div className="bg-[#1a1a1a] hidden md:block overflow-x-auto rounded-lg border border-gray-800 shadow-lg">
                    <table className="min-w-full divide-y divide-gray-800">
                      <thead className="bg-[#1a1a1a]">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            Subscribed At
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-[#1a1a1a] divide-y divide-gray-800">
                        {subscribers.map((sub) => (
                          <tr key={sub._id} className="hover:bg-[#252525] transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white font-medium">
                              {sub.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                              {new Date(sub.subscribedAt).toLocaleString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span
                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  sub.unsubscribed
                                    ? 'bg-red-900/30 text-red-300 border border-red-800'
                                    : 'bg-emerald-900/30 text-emerald-300 border border-emerald-800'
                                }`}
                              >
                                {sub.unsubscribed ? 'Unsubscribed' : 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <button
                                onClick={() => handleDeleteSubscriber(sub._id, sub.email)}
                                className="inline-flex items-center px-3 py-1.5 bg-red-900/30 text-red-300 border border-red-800 rounded-lg hover:bg-red-900/50 hover:border-red-700 transition-all duration-200"
                                title="Delete subscriber"
                              >
                                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {subscribers.map((sub) => (
                      <div key={sub._id} className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Email</p>
                            <p className="text-sm text-white font-medium break-all">{sub.email}</p>
                          </div>
                          <span
                            className={`ml-2 px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full whitespace-nowrap ${
                              sub.unsubscribed
                                ? 'bg-red-900/30 text-red-300 border border-red-800'
                                : 'bg-emerald-900/30 text-emerald-300 border border-emerald-800'
                            }`}
                          >
                            {sub.unsubscribed ? 'Unsubscribed' : 'Active'}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-400 uppercase mb-1">Subscribed At</p>
                          <p className="text-sm text-gray-400">{new Date(sub.subscribedAt).toLocaleString()}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteSubscriber(sub._id, sub.email)}
                          className="w-full inline-flex items-center justify-center px-3 py-2 bg-red-900/30 text-red-300 border border-red-800 rounded-lg hover:bg-red-900/50 hover:border-red-700 transition-all duration-200"
                          title="Delete subscriber"
                        >
                          <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Delete Subscriber
                          </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-2 bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
                    <p className="text-sm text-gray-400">
                      Total subscribers: <span className="text-white font-semibold">{subscribers.length}</span>
                    </p>
                    <p className="text-sm text-gray-400">
                      Active: <span className="text-emerald-400 font-semibold">{subscribers.filter(s => !s.unsubscribed).length}</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 bg-[#1a1a1a] border border-gray-800 rounded-lg p-8 text-center">
                  <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-gray-400">
                    No subscribers loaded. Click "Fetch Subscribers" to load them.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'newsletter' && (
            <div className="p-4 sm:p-6 lg:p-8">
              <div className="flex items-center mb-6 sm:mb-8">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-lg flex items-center justify-center mr-3 sm:mr-4 shadow-lg shadow-emerald-900/30 flex-shrink-0">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold text-white">Send Newsletter</h2>
                  <p className="text-gray-400 text-xs sm:text-sm mt-1">Compose and send email to subscribers</p>
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="template" className="bg-[#1a1a1a] block text-sm font-semibold text-gray-300 mb-3">
                    Template
                  </label>
                  <select
                    id="template"
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-[#1a1a1a] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  >
                    {NEWSLETTER_TEMPLATES.map((template) => (
                      <option key={template.name} value={template.name}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-sm font-semibold text-gray-300 mb-3">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={newsletterSubject}
                    onChange={(e) => setNewsletterSubject(e.target.value)}
                    placeholder="Enter newsletter subject..."
                    className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  />
                </div>
                
                <div>
                  <label htmlFor="content" className="block text-sm font-semibold text-gray-300 mb-3">
                    Content
                  </label>
                  <textarea
                    id="content"
                    value={newsletterContent}
                    onChange={(e) => setNewsletterContent(e.target.value)}
                    placeholder="Write your newsletter content here... (Use double line breaks for paragraphs)"
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-700 rounded-lg bg-[#1a1a1a] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm leading-relaxed transition-all font-mono sm:rows-14"
                  />
                  <div className="mt-2 flex items-start">
                    <svg className="w-4 h-4 text-gray-500 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <p className="text-xs text-gray-500">
                      Tip: Use double line breaks (Enter twice) to create new paragraphs. Single line breaks will be preserved.
                    </p>
                  </div>
                </div>
                
                <div className="pt-4">
                  <button
                    onClick={handleSendNewsletter}
                    disabled={sending}
                    className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-medium rounded-lg hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {sending ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Sending...
                      </span>
                    ) : 'Send Newsletter'}
                  </button>
                </div>
                
                {sendStatus && (
                  <div className={`mt-4 p-4 rounded-lg border ${
                    sendStatus.includes('success') 
                      ? 'bg-emerald-900/20 border-emerald-800 text-emerald-300' 
                      : 'bg-red-900/20 border-red-800 text-red-300'
                  }`}>
                    <div className="flex items-start">
                      {sendStatus.includes('success') ? (
                        <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 mr-2 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      )}
                      <p className="text-sm font-medium">
                        {sendStatus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
