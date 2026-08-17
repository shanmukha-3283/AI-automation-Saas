"use client";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChatInterface, Message } from "@/components/ChatInterface"
import { LogOut, Settings } from "lucide-react";

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

function StatusBadge({ status }: { status: Lead['status'] }) {
  const statusStyles = {
    new: "bg-blue-100 text-blue-700 border-blue-200",
    qualifying: "bg-amber-100 text-amber-700 border-amber-200",
    qualified: "bg-emerald-100 text-emerald-700 border-emerald-200",
    disqualified: "bg-stone-100 text-stone-700 border-stone-200",
    escalated: "bg-rose-100 text-rose-700 border-rose-200",
  };

  return (
    <Badge variant="outline" className={`capitalize transition-colors ${statusStyles[status]}`}>
      {status}
    </Badge>
  );
}

export function DashboardClient({ initialLeads, clientId }: { initialLeads: Lead[], clientId: string }) {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const router = useRouter();

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
    if (!selectedLead) return;
    
    // Poll every 3 seconds for new messages
    const interval = setInterval(() => {
      fetchMessages(selectedLead.id);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedLead, clientId]);

  return (
    <main className="min-h-screen bg-surface-container-low p-8 text-on-surface font-body-md">
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary-pure">
              Lead Intelligence
            </h1>
            <p className="text-text-muted mt-1">Modern Corporate AI Pipeline.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors cursor-pointer border border-emerald-200 py-1.5 px-4 text-sm font-medium">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span>
              System Online
            </Badge>
            <button
              onClick={() => router.push('/settings')}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
            <button
              onClick={() => signOut()}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
            >
              <LogOut size={16} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-surface-pure border-border-subtle shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">Total Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-pure">{initialLeads.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-surface-pure border-border-subtle shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">Qualified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {initialLeads.filter(l => l.status === 'qualified').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-surface-pure border-border-subtle shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">Escalated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-rose-600">
                {initialLeads.filter(l => l.status === 'escalated').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid: Table & Chat */}
        <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
          
          {/* Left Column: Leads Table */}
          <Card className="bg-surface-pure border-border-subtle shadow-sm overflow-hidden rounded-2xl h-fit">
            <CardHeader className="bg-surface-pure border-b border-border-subtle">
              <CardTitle className="text-xl text-primary-pure">Recent Activity</CardTitle>
              <CardDescription className="text-text-muted">Monitor your automated WhatsApp interactions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-surface-container-lowest">
                  <TableRow className="border-border-subtle hover:bg-transparent">
                    <TableHead className="text-text-muted font-semibold h-12 px-6">Name</TableHead>
                    <TableHead className="text-text-muted font-semibold h-12">Contact</TableHead>
                    <TableHead className="text-text-muted font-semibold h-12">Company</TableHead>
                    <TableHead className="text-text-muted font-semibold h-12">Budget</TableHead>
                    <TableHead className="text-text-muted font-semibold h-12">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {initialLeads.length === 0 ? (
                    <TableRow className="border-border-subtle">
                      <TableCell colSpan={5} className="h-32 text-center text-text-muted">
                        No leads detected. Start a conversation!
                      </TableCell>
                    </TableRow>
                  ) : (
                    initialLeads.map((lead) => (
                      <TableRow 
                        key={lead.id} 
                        onClick={() => handleLeadClick(lead)}
                        className={`border-border-subtle hover:bg-surface-container/50 transition-colors cursor-pointer ${selectedLead?.id === lead.id ? 'bg-surface-container-low' : ''}`}
                      >
                        <TableCell className="font-medium text-on-surface px-6 py-4">{lead.name}</TableCell>
                        <TableCell className="text-text-muted">
                          {lead.email}
                          <br />
                          <span className="text-xs">{lead.phone || 'No phone'}</span>
                        </TableCell>
                        <TableCell className="text-text-muted">{lead.company || '-'}</TableCell>
                        <TableCell className="text-primary-container font-medium">
                          {lead.budget ? `$${Number(lead.budget).toLocaleString()}` : '-'}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={lead.status} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Right Column: Live Chat View */}
          <div className="h-[600px] flex flex-col">
            <h2 className="text-sm font-semibold text-text-muted mb-3 uppercase tracking-widest">
              Live Chat View
              {loadingMessages && <span className="ml-2 text-xs normal-case animate-pulse">Loading...</span>}
            </h2>
            <div className="flex-1 min-h-0">
              <ChatInterface 
                messages={messages} 
                leadName={selectedLead?.name}
                leadId={selectedLead?.id}
                clientId={clientId}
              />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
