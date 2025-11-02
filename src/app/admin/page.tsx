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
      <div className="min-h-screen flex items-center justify-center bg-[#171717]">
        <div className="max-w-md w-full bg-[#2c3440] rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-100">Admin Login</h1>
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
    <div className="min-h-screen bg-[#171717]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-100">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('test')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'test'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Test Functions
            </button>
            <button
              onClick={() => setActiveTab('subscribers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'subscribers'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Subscribers
            </button>
            <button
              onClick={() => setActiveTab('newsletter')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'newsletter'
                  ? 'border-emerald-500 text-emerald-500'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              Send Newsletter
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-[#2c3440] rounded-lg shadow-lg p-6">
          {activeTab === 'test' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-100">Test Database Connection</h2>
              <button
                onClick={handleTestDB}
                className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Test DB
              </button>
              {testResult && (
                <pre className="mt-4 p-4 bg-[#1a1d23] rounded-lg text-sm overflow-x-auto text-gray-100">
                  {testResult}
                </pre>
              )}
            </div>
          )}

          {activeTab === 'subscribers' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-100">Subscribers</h2>
                <button
                  onClick={fetchSubscribers}
                  disabled={subscribersLoading}
                  className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {subscribersLoading ? 'Loading...' : 'Fetch Subscribers'}
                </button>
              </div>
              
              {subscribers.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-[#1a1d23]">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Subscribed At
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-[#2c3440] divide-y divide-gray-700">
                      {subscribers.map((sub) => (
                        <tr key={sub._id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-100">
                            {sub.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
                            {new Date(sub.subscribedAt).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                sub.unsubscribed
                                  ? 'bg-red-900 text-red-200'
                                  : 'bg-green-900 text-green-200'
                              }`}
                            >
                              {sub.unsubscribed ? 'Unsubscribed' : 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="mt-4 text-sm text-gray-400">
                    Total: {subscribers.length} subscribers
                  </p>
                </div>
              ) : (
                <p className="text-gray-400">
                  No subscribers loaded. Click "Fetch Subscribers" to load them.
                </p>
              )}
            </div>
          )}

          {activeTab === 'newsletter' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-gray-100">Send Newsletter</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="template" className="block text-sm font-medium text-gray-300 mb-2">
                    Template
                  </label>
                  <select
                    id="template"
                    value={selectedTemplate}
                    onChange={(e) => handleTemplateChange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#3d4754] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {NEWSLETTER_TEMPLATES.map((template) => (
                      <option key={template.name} value={template.name}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={newsletterSubject}
                    onChange={(e) => setNewsletterSubject(e.target.value)}
                    placeholder="Newsletter subject..."
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#3d4754] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                  </label>
                  <textarea
                    id="content"
                    value={newsletterContent}
                    onChange={(e) => setNewsletterContent(e.target.value)}
                    placeholder="Write your newsletter content here... (Use double line breaks for paragraphs)"
                    rows={14}
                    className="w-full px-4 py-2 border border-gray-600 rounded-lg bg-[#3d4754] text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm leading-relaxed"
                  />
                  <p className="mt-1 text-xs text-gray-400">
                    Tip: Use double line breaks (Enter twice) to create new paragraphs. Single line breaks will be preserved.
                  </p>
                </div>
                <button
                  onClick={handleSendNewsletter}
                  disabled={sending}
                  className="px-6 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Newsletter'}
                </button>
                {sendStatus && (
                  <p className={`text-sm ${sendStatus.includes('success') ? 'text-green-400' : 'text-red-400'}`}>
                    {sendStatus}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
