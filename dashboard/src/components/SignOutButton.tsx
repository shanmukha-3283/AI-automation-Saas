"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export default function SignOutButton() {
  return (
    <button 
      onClick={() => signOut({ callbackUrl: '/login' })}
      className="flex items-center space-x-2 text-text-muted hover:text-on-surface transition-colors"
    >
      <LogOut className="h-5 w-5" />
      <span>Sign out</span>
    </button>
  );
}
