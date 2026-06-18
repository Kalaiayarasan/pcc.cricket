import Link from 'next/link';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#061409] border-t border-[#1a6b3a]/30 pt-12 pb-8 mt-12">
      <div className="container">
        <div className="grid-4 mb-10">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl font-black text-white">PCC</span>
              <span className="text-[#d4a017] font-bold uppercase tracking-widest text-sm">Pungampatti</span>
            </div>
            <p className="text-[#8fa899] text-sm max-w-sm mb-6">
              The official tournament management platform for Pungampatti Cricket Club. 
              Bringing live action, scores, and updates to the village and beyond.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm border-b border-[#1a6b3a]/30 pb-2 inline-block">Quick Links</h4>
            <ul className="flex flex-col gap-2">
              <li><Link href="/live" className="text-[#8fa899] hover:text-[#d4a017] text-sm transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#1a6b3a]"></span>Live Matches</Link></li>
              <li><Link href="/upcoming" className="text-[#8fa899] hover:text-[#d4a017] text-sm transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#1a6b3a]"></span>Schedule</Link></li>
              <li><Link href="/points-table" className="text-[#8fa899] hover:text-[#d4a017] text-sm transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#1a6b3a]"></span>Points Table</Link></li>
              <li><Link href="/teams" className="text-[#8fa899] hover:text-[#d4a017] text-sm transition-colors flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#1a6b3a]"></span>Teams</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-4 uppercase tracking-wider text-sm border-b border-[#1a6b3a]/30 pb-2 inline-block">Contact</h4>
            <ul className="flex flex-col gap-2">
              <li className="text-[#8fa899] text-sm">Pungampatti Village</li>
              <li className="text-[#8fa899] text-sm">Cricket Ground</li>
              <li className="mt-2"><Link href="/admin/login" className="text-[#1a6b3a] hover:text-[#d4a017] text-xs font-mono uppercase tracking-widest">Admin Access →</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-[#1a6b3a]/20 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#8fa899] text-xs">
            &copy; {currentYear} Pungampatti Cricket Club. All rights reserved.
          </p>
          <div className="text-[#8fa899] text-xs flex items-center gap-1">
            Built with <span className="text-[#e74c3c]">♥</span> for Cricket
          </div>
        </div>
      </div>
    </footer>
  );
}
