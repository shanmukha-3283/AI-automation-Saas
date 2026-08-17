'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [formData, setFormData] = useState({
    twilioAccountSid: '',
    twilioAuthToken: '',
    twilioPhoneNumber: '',
    systemPrompt: ''
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const clientId = (session.user as any).clientId;
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      fetch(`${API_URL}/api/clients/me?clientId=${clientId}`)
        .then(res => res.json())
        .then(data => {
          if (data.success && data.client) {
            setFormData({
              twilioAccountSid: data.client.twilioAccountSid || '',
              twilioAuthToken: data.client.twilioAuthToken || '',
              twilioPhoneNumber: data.client.twilioPhoneNumber || '',
              systemPrompt: data.client.systemPrompt || ''
            });
          }
        })
        .catch(err => {
          console.error(err);
          setError('Failed to load settings');
        })
        .finally(() => setLoading(false));
    }
  }, [status, session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const clientId = (session?.user as any)?.clientId;
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

    try {
      const res = await fetch(`${API_URL}/api/clients/me?clientId=${clientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (data.success) {
        setSuccess('Settings saved successfully!');
      } else {
        setError(data.error || 'Failed to save settings');
      }
    } catch (err) {
      setError('Network error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-black">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-black">
      <div className="max-w-3xl mx-auto space-y-8">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Tenant Settings
            </h1>
            <p className="text-gray-500 mt-1">Configure your AI automation instance.</p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm text-sm font-medium hover:bg-gray-50"
          >
            Back to Dashboard
          </button>
        </div>

        <form onSubmit={handleSubmit} className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-6 space-y-6">
            
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">Twilio Configuration</h2>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account SID</label>
                  <input
                    type="text"
                    value={formData.twilioAccountSid}
                    onChange={e => setFormData({ ...formData, twilioAccountSid: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Auth Token</label>
                  <input
                    type="password"
                    value={formData.twilioAuthToken}
                    onChange={e => setFormData({ ...formData, twilioAuthToken: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="••••••••••••••••••••••••••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input
                    type="text"
                    value={formData.twilioPhoneNumber}
                    onChange={e => setFormData({ ...formData, twilioPhoneNumber: e.target.value })}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="+1234567890"
                  />
                </div>
              </div>
            </div>

            <hr className="border-gray-200" />

            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">AI Agent Settings</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700">System Prompt / Business Context</label>
                <p className="text-sm text-gray-500 mb-2">Define your business details so the AI knows how to respond.</p>
                <textarea
                  rows={6}
                  value={formData.systemPrompt}
                  onChange={e => setFormData({ ...formData, systemPrompt: e.target.value })}
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="You are an AI assistant for Test Business Inc. We sell enterprise software..."
                />
              </div>
            </div>

          </div>

          <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div>
              {error && <span className="text-red-600 text-sm">{error}</span>}
              {success && <span className="text-emerald-600 text-sm">{success}</span>}
            </div>
            <button
              type="submit"
              disabled={saving}
              className="flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
