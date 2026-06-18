'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Live', href: '/live' },
    { label: 'Upcoming', href: '/upcoming' },
    { label: 'Results', href: '/results' },
    { label: 'Points Table', href: '/points-table' },
    { label: 'Teams', href: '/teams' },
    { label: 'Players', href: '/players' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && pathname !== '/') return false;
    return pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0d1f13]/90 backdrop-blur-md border-b border-[#d4a017]/30 shadow-md">
      <div className="container flex h-[72px] items-center justify-between">
        <Link href="/" className="flex items-center gap-3 transition-transform hover:scale-105">
          <Image src="/pcc-logo.png" alt="PCC Logo" width={48} height={48} className="rounded-full" />
          <div className="flex flex-col">
            <span className="text-xl font-black text-white leading-tight">PCC</span>
            <span className="text-[0.65rem] font-bold text-[#d4a017] uppercase tracking-widest">Pungampatti</span>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                isActive(item.href)
                  ? 'bg-[#1a6b3a]/40 text-[#d4a017] border border-[#d4a017]/30 shadow-[0_0_15px_rgba(212,160,23,0.15)]'
                  : 'text-[#8dd4a5] hover:text-white hover:bg-[#162b1c]'
              }`}
            >
              {item.label}
              {item.label === 'Live' && (
                <span className="ml-2 inline-block w-2 h-2 rounded-full bg-[#e74c3c] animate-pulse-live" />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/admin/login" className="hidden md:flex btn btn-outline-gold btn-sm">
            Admin
          </Link>
          
          {/* Mobile Menu Button - can implement full mobile menu later */}
          <button className="md:hidden p-2 text-[#d4a017]">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
