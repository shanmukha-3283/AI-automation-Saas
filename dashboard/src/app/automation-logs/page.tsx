import { LogsClient } from "./LogsClient";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AutomationLogsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/login');
  }

  if ((session.user as any).role === 'superadmin') {
    redirect('/admin');
  }

  const clientId = (session.user as any).clientId;

  return <LogsClient clientId={clientId} />;
}
