"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Save, Loader2, Menu, X, Shield, Bot, Link as LinkIcon } from "lucide-react";

export function SettingsClient({ clientId }: { clientId: string }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  
  const [formData, setFormData] = useState({
    systemPrompt: "",
    escalationWebhookUrl: "",
    twilioAccountSid: "",
    twilioAuthToken: "",
    twilioPhoneNumber: ""
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${API_URL}/api/clients/me?clientId=${clientId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.client) {
            setFormData({
              systemPrompt: data.client.systemPrompt || "",
              escalationWebhookUrl: data.client.escalationWebhookUrl || "",
              twilioAccountSid: data.client.twilioAccountSid || "",
              twilioAuthToken: data.client.twilioAuthToken || "",
              twilioPhoneNumber: data.client.twilioPhoneNumber || ""
            });
          }
        }
      } catch (err) {
        console.error("Failed to fetch settings", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, [clientId, API_URL]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg("");
    
    try {
      const res = await fetch(`${API_URL}/api/clients/me?clientId=${clientId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (res.ok) {
        setSuccessMsg("Settings updated successfully!");
        setTimeout(() => setSuccessMsg(""), 3000);
      }
    } catch (err) {
      console.error("Failed to save settings", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg border border-slate-200 shadow-sm"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-500" /> : <Menu className="w-5 h-5 text-slate-500" />}
      </button>

      <Sidebar role="tenant" isMobileMenuOpen={isMobileMenuOpen} />

      <main className="flex-1 overflow-y-auto bg-white border-l border-slate-200 z-30">
        <div className="max-w-4xl mx-auto px-6 md:px-10 py-8 md:py-12">
          
          <header className="mb-10 animate-fade-in-up">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Workspace Settings</h1>
            <p className="text-slate-500 text-sm">Configure your AI agent's personality, integrations, and webhooks.</p>
          </header>

          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in-up animate-delay-100 pb-20">
              
              {/* AI Personality Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 ring-1 ring-slate-900/5">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">AI Personality</h2>
                    <p className="text-sm text-slate-500">Define how the LangGraph agent should behave.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">System Prompt</label>
                    <textarea 
                      value={formData.systemPrompt}
                      onChange={(e) => setFormData({...formData, systemPrompt: e.target.value})}
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all resize-y"
                      placeholder="You are a helpful assistant..."
                    />
                    <p className="text-xs text-slate-500 mt-2">This prompt overrides the default Lumina Intelligence system prompt for all new conversations.</p>
                  </div>
                </div>
              </div>

              {/* Integrations Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 ring-1 ring-slate-900/5">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Webhooks & Routing</h2>
                    <p className="text-sm text-slate-500">Configure where escalated leads are sent.</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">Escalation Webhook URL</label>
                    <input 
                      type="url"
                      value={formData.escalationWebhookUrl}
                      onChange={(e) => setFormData({...formData, escalationWebhookUrl: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                      placeholder="https://your-crm.com/api/webhook"
                    />
                    <p className="text-xs text-slate-500 mt-2">When a lead status changes to 'escalated', a POST request will be sent here.</p>
                  </div>
                </div>
              </div>

              {/* Twilio Section */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8 ring-1 ring-slate-900/5">
                <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-4">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Twilio Integration</h2>
                    <p className="text-sm text-slate-500">Required for proactive WhatsApp follow-ups.</p>
                  </div>
                </div>
                
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">Account SID</label>
                    <input 
                      type="text"
                      value={formData.twilioAccountSid}
                      onChange={(e) => setFormData({...formData, twilioAccountSid: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">Auth Token</label>
                    <input 
                      type="password"
                      value={formData.twilioAuthToken}
                      onChange={(e) => setFormData({...formData, twilioAuthToken: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-1.5">WhatsApp Number</label>
                    <input 
                      type="text"
                      value={formData.twilioPhoneNumber}
                      onChange={(e) => setFormData({...formData, twilioPhoneNumber: e.target.value})}
                      className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm outline-none transition-all"
                      placeholder="whatsapp:+1234567890"
                    />
                  </div>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-4 pt-4">
                <button 
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white px-6 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {saving ? "Saving..." : "Save Settings"}
                </button>
                {successMsg && (
                  <span className="text-emerald-600 text-sm font-medium animate-fade-in-up flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {successMsg}
                  </span>
                )}
              </div>

            </form>
          )}

        </div>
      </main>
    </div>
  );
}
