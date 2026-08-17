import { DashboardClient, Lead } from "@/components/DashboardClient";
import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

async function getLeads(clientId: string): Promise<Lead[]> {
  try {
    const res = await fetch(`${API_URL}/api/leads?clientId=${clientId}`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    return data.leads || [];
  } catch (error) {
    console.error("Failed to fetch leads", error);
    return [];
  }
}

export default async function Dashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  const clientId = (session.user as any).clientId;
  const leads = await getLeads(clientId);

  return <DashboardClient initialLeads={leads} clientId={clientId} />;
}
