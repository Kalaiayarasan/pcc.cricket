'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
    router.refresh();
  };

  const menuItems = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: '📊' },
    { label: 'Matches', href: '/admin/matches', icon: '🏏' },
    { label: 'Teams', href: '/admin/teams', icon: '🛡️' },
    { label: 'Players', href: '/admin/players', icon: '👤' },
    { label: 'Announcements', href: '/admin/announcements', icon: '📢' },
  ];

  return (
    <aside className="w-[260px] h-screen bg-[#0d1f13] border-r border-[#1a6b3a]/30 fixed left-0 top-0 flex flex-col z-40">
      <div className="p-6 border-b border-[#1a6b3a]/30">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#1a6b3a] to-[#d4a017] flex items-center justify-center font-black text-white shadow-[0_0_15px_rgba(212,160,23,0.3)]">
            PCC
          </div>
          <div className="flex flex-col">
            <span className="text-white font-bold leading-tight">Admin Panel</span>
            <span className="text-[#8fa899] text-xs">Tournament Ops</span>
          </div>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <div className="text-xs font-bold text-[#4caf72] uppercase tracking-wider mb-2 px-3">Management</div>
        
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                isActive 
                  ? 'bg-gradient-to-r from-[#1a6b3a]/40 to-transparent text-[#d4a017] border-l-2 border-[#d4a017]' 
                  : 'text-[#8fa899] hover:bg-[#162b1c] hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-[#1a6b3a]/30">
        <button 
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg font-medium text-[#e74c3c] hover:bg-[#e74c3c]/10 transition-colors"
        >
          <span>🚪</span>
          <span>Sign Out</span>
        </button>
        <div className="mt-4 text-center">
          <Link href="/" className="text-xs text-[#8fa899] hover:text-[#d4a017] transition-colors underline">
            Back to Public Site
          </Link>
        </div>
      </div>
    </aside>
  );
}
