"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

import { useState, useEffect, useRef } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { ChatInterface, Message } from "@/components/ChatInterface"
import { LogOut, Settings, Search, Bell, Users, CheckCircle2, AlertCircle, Menu, X } from "lucide-react";
import { Sidebar } from "@/components/Sidebar";

export interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  budget: string | null;
  status: 'new' | 'qualifying' | 'qualified' | 'disqualified' | 'escalated';
  created_at: string;
}

export function DashboardClient({ initialLeads, clientId }: { initialLeads: Lead[], clientId: string }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const router = useRouter();

  const selectedLeadRef = useRef(selectedLead);
  useEffect(() => {
    selectedLeadRef.current = selectedLead;
  }, [selectedLead]);

  const fetchMessages = async (leadId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/leads/${leadId}/messages?clientId=${clientId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages", error);
    }
  };

  const handleLeadClick = async (lead: Lead) => {
    if (selectedLead?.id === lead.id) return;
    setSelectedLead(lead);
    setLoadingMessages(true);
    setMessages([]); // clear old messages
    await fetchMessages(lead.id);
    setLoadingMessages(false);
  };

  useEffect(() => {
    const socket: Socket = io(API_URL);

    socket.on("connect", () => {
      setSocketConnected(true);
      socket.emit("joinRoom", clientId);
    });

    socket.on("disconnect", () => {
      setSocketConnected(false);
    });

    socket.on("new_message", (msg: Message & { leadId: string }) => {
      if (selectedLeadRef.current?.id === msg.leadId) {
        setMessages(prev => [...prev, msg]);
      }
    });

    socket.on("lead_updated", (updatedLead: Lead) => {
      setLeads(prevLeads => {
        const exists = prevLeads.find(l => l.id === updatedLead.id);
        if (exists) {
          return prevLeads.map(l => l.id === updatedLead.id ? updatedLead : l);
        } else {
          return [updatedLead, ...prevLeads];
        }
      });

      if (selectedLeadRef.current?.id === updatedLead.id) {
        setSelectedLead(updatedLead);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [clientId]);

  // Derived metrics
  const totalLeads = leads.length;
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length;
  const escalatedLeads = leads.filter(l => l.status === 'escalated').length;

  return (
    <div className="flex h-screen bg-[#f8fafc] text-slate-900 font-sans overflow-hidden">
      
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-white rounded-lg border border-slate-200 shadow-sm"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X className="w-5 h-5 text-slate-500" /> : <Menu className="w-5 h-5 text-slate-500" />}
      </button>

      <Sidebar role="tenant" isMobileMenuOpen={isMobileMenuOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc]">
        {/* TopAppBar */}
        <header className="h-20 border-b border-slate-200 px-6 md:px-10 flex items-center justify-between shrink-0 bg-white">
          <div className="flex items-center gap-4">
            <div className="relative w-80 group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
              <input className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm shadow-sm transition-all outline-none" placeholder="Search leads, chats, or logs..." type="text" />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <span className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full border ${socketConnected ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-700 border-red-200'} transition-colors`}>
              <span className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
              {socketConnected ? 'System Live' : 'Reconnecting...'}
            </span>
            <div className="h-6 w-px bg-slate-200 mx-1"></div>
            <button className="text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full p-2.5 transition-colors relative">
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              <Bell className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto px-6 md:px-10 py-8">
          
          <div className="mb-8 animate-fade-in-up">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 mb-2">Lead Intelligence</h1>
            <p className="text-slate-500 text-sm">Overview of your current lead pipeline and AI performance metrics.</p>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Card 1: Total Leads */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-all animate-fade-in-up">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Leads</h3>
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{totalLeads}</span>
              </div>
            </div>

            {/* Card 2: Qualified Leads */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-all animate-fade-in-up animate-delay-100">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Qualified</h3>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{qualifiedLeads}</span>
              </div>
            </div>

            {/* Card 3: Escalated Leads */}
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-slate-200 shadow-sm ring-1 ring-slate-900/5 hover:shadow-md transition-all animate-fade-in-up animate-delay-200">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Escalated</h3>
                <div className="p-2 rounded-xl bg-red-50 text-red-600">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold tracking-tight text-slate-900">{escalatedLeads}</span>
              </div>
            </div>
          </div>

          {/* Split Grid for Table and Chat */}
          <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">

            {/* Data Table Section */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm ring-1 ring-slate-900/5 animate-fade-in-up animate-delay-300 overflow-hidden flex flex-col">
              <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-lg font-bold tracking-tight text-slate-900">Recent Leads</h3>
              </div>
              <div className="overflow-x-auto w-full flex-1">
                <table className="w-full text-sm text-left whitespace-nowrap">
                  <thead className="text-xs text-slate-500 bg-slate-50/80 sticky top-0 z-10 border-b border-slate-200 shadow-sm uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 font-bold">Lead Name</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold">Contact</th>
                      <th className="px-6 py-4 font-bold">Est. Budget</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {leads.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="h-32 text-center text-slate-400">
                          No leads detected. Start a conversation!
                        </td>
                      </tr>
                  ) : (
                    leads.map((lead) => {
                      const isSelected = selectedLead?.id === lead.id;

                      const statusConfig = {
                        new: { bg: 'bg-blue-100', text: 'text-blue-700', ring: 'ring-blue-200', dot: 'bg-blue-500' },
                        qualifying: { bg: 'bg-amber-100', text: 'text-amber-700', ring: 'ring-amber-200', dot: 'bg-amber-500' },
                        qualified: { bg: 'bg-emerald-100', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-500' },
                        disqualified: { bg: 'bg-stone-100', text: 'text-stone-700', ring: 'ring-stone-200', dot: 'bg-stone-500' },
                        escalated: { bg: 'bg-rose-100', text: 'text-rose-700', ring: 'ring-rose-200', dot: 'bg-rose-500' },
                      };

                      const conf = statusConfig[lead.status] || statusConfig.new;

                      return (
                        <tr
                          key={lead.id}
                          onClick={() => handleLeadClick(lead)}
                          className={`group cursor-pointer relative z-10 transition-colors ${isSelected ? 'bg-slate-50' : 'hover:bg-slate-50/50'}`}
                        >
                          <td className="px-6 py-4 relative">
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${isSelected ? 'bg-blue-600 opacity-100' : 'bg-blue-600 opacity-0 group-hover:opacity-100'} transition-all duration-300`}></div>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shadow-sm ring-1 ring-blue-200/50">
                                {lead.name.substring(0, 2).toUpperCase()}
                              </div>
                              <span className="font-semibold text-slate-700 group-hover:text-blue-600 transition-colors">{lead.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${conf.bg} ${conf.text} ring-1 ${conf.ring} flex inline-flex items-center gap-1.5 w-max`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${conf.dot}`}></span> {lead.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-col text-sm text-slate-500 font-medium">
                              <span>{lead.email}</span>
                              <span className="text-[11px] text-slate-400">{lead.phone || '-'}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4 font-semibold text-slate-700">
                            {lead.budget ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(lead.budget)) : '-'}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Chat Section */}
          <div className="h-[600px] flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm ring-1 ring-slate-900/5 animate-fade-in-up animate-delay-500 overflow-hidden">
            <ChatInterface
              messages={messages}
              leadName={selectedLead?.name}
              leadId={selectedLead?.id}
              clientId={clientId}
            />
          </div>

        </div>
      </main>
    </div>
    </div>
  );
}
