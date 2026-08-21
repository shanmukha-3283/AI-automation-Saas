"use client";

import { LogOut, Settings, BarChart3, Users, Activity, MessageSquare, ListTodo, LayoutDashboard } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface SidebarProps {
  role: 'superadmin' | 'tenant';
  isMobileMenuOpen: boolean;
}

export function Sidebar({ role, isMobileMenuOpen }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const superadminLinks = [
    { href: "/admin", icon: LayoutDashboard, label: "Overview" },
    { href: "/admin/clients", icon: Users, label: "Clients" },
    { href: "/admin/revenue", icon: BarChart3, label: "Revenue" },
    { href: "/admin/system-health", icon: Activity, label: "System Health" },
  ];

  const tenantLinks = [
    { href: "/", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/automation-logs", icon: Activity, label: "Automation Logs" },
  ];

  const links = role === 'superadmin' ? superadminLinks : tenantLinks;

  const userName = session?.user?.name || (role === 'superadmin' ? 'Platform Admin' : 'Tenant Admin');
  const userEmail = session?.user?.email || (role === 'superadmin' ? 'admin@stitch.com' : 'Workspace User');
  const userInitials = userName.substring(0, 2).toUpperCase();

  return (
    <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#f8fafc] border-r border-slate-200 flex flex-col transition-transform duration-300 md:translate-x-0 md:static md:flex-shrink-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="h-16 flex items-center px-6 mb-4 mt-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">
            L
          </div>
          <div>
            <h1 className="text-[15px] font-semibold text-slate-900 leading-tight">Lumina</h1>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">Intelligence</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-3 space-y-8 minimal-scrollbar pb-6">
        <div>
          <div className="px-3 mb-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {role === 'superadmin' ? 'Platform' : 'Workspace'}
          </div>
          <div className="space-y-0.5">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className={`flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                    isActive 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className={`w-[18px] h-[18px] ${isActive ? '' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      <div className="p-4 mt-auto border-t border-slate-200 bg-[#f8fafc]">
        <div className="flex items-center gap-3 p-2">
          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-medium text-sm shrink-0">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{userName}</p>
            <p className="text-xs text-slate-500 truncate">{userEmail}</p>
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          <Link href="/settings" className={`flex-1 flex justify-center items-center p-2 rounded-md transition-colors ${pathname === '/settings' ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'}`} title="Settings">
            <Settings className="w-4 h-4" />
          </Link>
          <button 
            onClick={() => signOut()}
            className="flex-1 flex justify-center items-center p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-md transition-colors" title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
