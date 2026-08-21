import { Construction } from "lucide-react";
import Link from "next/link";

export default function ComingSoonPage({ title, backHref }: { title: string, backHref: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] bg-white rounded-xl border border-slate-200 shadow-sm p-10 text-center animate-fade-in-up">
      <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
        <Construction className="w-8 h-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 mb-2">{title}</h2>
      <p className="text-slate-500 max-w-md mb-8">
        This module is currently under construction and will be available in the next platform update.
      </p>
      <Link href={backHref} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm">
        Return to Dashboard
      </Link>
    </div>
  );
}
