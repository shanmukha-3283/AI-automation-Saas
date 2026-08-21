"use client";

import { useEffect, useState } from "react";
import { LogOut, Settings, BarChart3, Users, Activity, MessageSquare, ListTodo, Plus, ChevronRight, Menu, X, ArrowUpRight, ArrowDownRight, LayoutDashboard } from "lucide-react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import Link from "next/link";

export default function AdminPage() {
  const router = useRouter();
  const [stats, setStats] = useState({ totalClients: 0, totalLeads: 0, totalTokens: 0 });
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    fetch(`${API_URL}/api/admin/stats`)
      .then(res => res.json())
      .then(data => {
        setStats(data);
        setLoading(false);
      })
      .catch(console.error);
  }, []);

  const revenue = stats.totalClients * 15000;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden">

      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg border border-slate-200 shadow-sm"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-500" /> : <Menu className="w-5 h-5 text-slate-500" />}
      </button>

      <Sidebar role="superadmin" isMobileMenuOpen={isMobileMenuOpen} />

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-white border-l border-slate-200 shadow-[-4px_0_24px_rgba(0,0,0,0.02)] z-30">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-8 md:py-12">

          <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-fade-in-up">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">Platform overview</h1>
              <p className="text-slate-500 text-sm">Real-time telemetry across every tenant running on Lumina Intelligence.</p>
            </div>
            <button className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm w-fit">
              <Plus className="w-4 h-4" />
              New client
            </button>
          </header>

          {/* KPI Metrics - Lovable Style Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

            {/* Metric 1 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up animate-delay-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-500">Active Tenants</h3>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalClients}</span>
                <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  +1 this month
                </span>
              </div>
            </div>

            {/* Metric 2 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up animate-delay-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-500">Total AI Conversations</h3>
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-slate-900">{loading ? '...' : stats.totalLeads}</span>
                <span className="flex items-center text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md mb-1">
                  <ArrowUpRight className="w-3 h-3 mr-0.5" />
                  Last 30 days
                </span>
              </div>
            </div>

            {/* Metric 3 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up animate-delay-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-500">Recurring Revenue (MRR)</h3>
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <BarChart3 className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-slate-900">
                  {loading ? '...' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(revenue)}
                </span>
                <span className="flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md mb-1">
                  Projected this month
                </span>
              </div>
            </div>

            {/* Metric 4 */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow animate-fade-in-up animate-delay-400">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-slate-500">LLM Compute (Tokens)</h3>
                <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-bold text-slate-900">
                  {loading ? '...' : new Intl.NumberFormat('en-US').format(stats.totalTokens || 0)}
                </span>
                <span className="flex items-center text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-md mb-1">
                  Total system usage
                </span>
              </div>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fade-in-up animate-delay-400">

            {/* Active Tenants List */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Active tenants</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Workspaces provisioned on the platform</p>
                </div>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                  View all
                </button>
              </div>
              <div className="divide-y divide-slate-100 flex-1">
                <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">RD</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Reliance Digital AI</p>
                      <p className="text-xs text-slate-500">admin@reliancedigital.in</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center font-bold">SP</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Stitch Platform</p>
                      <p className="text-xs text-slate-500">platform_admin@stitch.com</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
                <div className="p-4 hover:bg-slate-50 transition-colors flex items-center justify-between group cursor-pointer">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center font-bold">NC</div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Nova Clinics</p>
                      <p className="text-xs text-slate-500">ops@novaclinics.co</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-600 transition-colors" />
                </div>
              </div>
            </div>

            {/* Conversation Throughput Placeholder */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Conversation throughput</h2>
                  <p className="text-sm text-slate-500 mt-0.5">Handled by AI vs escalated to a human, last 7 days</p>
                </div>
              </div>
              <div className="p-6 flex-1 flex flex-col items-center justify-center min-h-[300px] text-center">
                <Activity className="w-12 h-12 text-slate-200 mb-4" />
                <p className="text-slate-500 text-sm font-medium">Analytics engine tracking active...</p>
                <p className="text-slate-400 text-xs mt-1">Sufficient data will populate charts shortly.</p>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}
