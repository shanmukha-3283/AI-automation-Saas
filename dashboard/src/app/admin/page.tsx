import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { LogOut } from "lucide-react";
import SignOutButton from "@/components/SignOutButton";

async function getStats() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${API_URL}/api/admin/stats`, { cache: 'no-store' });
  if (!res.ok) return { totalClients: 0, totalLeads: 0, totalMessages: 0 };
  const data = await res.json();
  return data.stats;
}

async function getClients() {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  const res = await fetch(`${API_URL}/api/admin/clients`, { cache: 'no-store' });
  if (!res.ok) return [];
  const data = await res.json();
  return data.clients;
}

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/login");
  }

  // Check if role is superadmin
  if ((session.user as any).role !== "superadmin") {
    redirect("/"); // Redirect back to normal dashboard if they aren't admin
  }

  const stats = await getStats();
  const clients = await getClients();

  return (
    <main className="min-h-screen bg-surface-container-low p-8 text-on-surface font-body-md">
      <div className="max-w-[1440px] mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-primary-pure">
              Platform Command Center
            </h1>
            <p className="text-text-muted mt-1">Super Admin Overview.</p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge className="bg-primary-fixed text-on-primary-fixed hover:bg-primary-fixed-dim transition-colors cursor-pointer py-1.5 px-4 text-sm font-medium">
              Admin Access
            </Badge>
            <SignOutButton />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-surface-pure border-border-subtle shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-pure">{stats.totalClients}</div>
            </CardContent>
          </Card>
          <Card className="bg-surface-pure border-border-subtle shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">Total Platform Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{stats.totalLeads}</div>
            </CardContent>
          </Card>
          <Card className="bg-surface-pure border-border-subtle shadow-sm rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-text-muted">Total Messages Handled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-primary-container">{stats.totalMessages}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Grid: Clients Table */}
        <Card className="bg-surface-pure border-border-subtle shadow-sm overflow-hidden rounded-2xl h-fit">
          <CardHeader className="bg-surface-pure border-b border-border-subtle">
            <CardTitle className="text-xl text-primary-pure">Active Tenants</CardTitle>
            <CardDescription className="text-text-muted">Monitor your B2B SaaS clients.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-surface-container-lowest">
                <TableRow className="border-border-subtle hover:bg-transparent">
                  <TableHead className="text-text-muted font-semibold h-12 px-6">Business Name</TableHead>
                  <TableHead className="text-text-muted font-semibold h-12">Admin Email</TableHead>
                  <TableHead className="text-text-muted font-semibold h-12">Role</TableHead>
                  <TableHead className="text-text-muted font-semibold h-12">WhatsApp Configured</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.length === 0 ? (
                  <TableRow className="border-border-subtle">
                    <TableCell colSpan={4} className="h-32 text-center text-text-muted">
                      No clients found.
                    </TableCell>
                  </TableRow>
                ) : (
                  clients.map((client: any) => (
                    <TableRow 
                      key={client.id} 
                      className="border-border-subtle hover:bg-surface-container/50 transition-colors"
                    >
                      <TableCell className="font-medium text-on-surface px-6 py-4">{client.name}</TableCell>
                      <TableCell className="text-text-muted">{client.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`capitalize ${client.role === 'superadmin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {client.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-text-muted">
                        {client.twilioPhoneNumber ? (
                           <span className="text-emerald-600 font-medium">Yes ({client.twilioPhoneNumber})</span>
                        ) : (
                           <span className="text-rose-600">Pending Setup</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
