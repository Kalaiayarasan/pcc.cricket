import Link from 'next/link';
import { getFallbackData } from '@/lib/fallback-data';

export const revalidate = 0; // Don't cache admin dashboard

export default async function AdminDashboardPage() {
  const fallbackData = getFallbackData();

  const teamsCount = fallbackData.teams.length;
  const playersCount = fallbackData.players.length;
  const matchesCount = fallbackData.matches.length;
  const liveMatchesCount = fallbackData.matches.filter((match) => match.status === 'live').length;

  const recentMatches = [...fallbackData.matches]
    .sort((a, b) => new Date(b.scheduled_at).getTime() - new Date(a.scheduled_at).getTime())
    .slice(0, 5)
    .map((match) => ({
      id: match.id,
      status: match.status,
      scheduled_at: match.scheduled_at,
      team1: { short_name: fallbackData.teams.find((team) => team.id === match.team1_id)?.short_name || '—' },
      team2: { short_name: fallbackData.teams.find((team) => team.id === match.team2_id)?.short_name || '—' },
    }));

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Dashboard</h1>
        <p className="text-[#8fa899]">Welcome to the PCC Tournament Admin Panel</p>
      </div>

      <div className="grid-4 mb-8">
        <div className="stat-card">
          <div className="text-3xl mb-2">🛡️</div>
          <div className="stat-value">{teamsCount || 0}</div>
          <div className="stat-label">Total Teams</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl mb-2">👤</div>
          <div className="stat-value">{playersCount || 0}</div>
          <div className="stat-label">Total Players</div>
        </div>
        <div className="stat-card">
          <div className="text-3xl mb-2">🏏</div>
          <div className="stat-value">{matchesCount || 0}</div>
          <div className="stat-label">Total Matches</div>
        </div>
        <div className="stat-card border-[#e74c3c]/30 shadow-[0_0_15px_rgba(231,76,60,0.15)] relative overflow-hidden">
          {liveMatchesCount && liveMatchesCount > 0 ? (
            <div className="absolute top-0 right-0 w-16 h-16 bg-[#e74c3c]/20 rounded-bl-full flex items-start justify-end p-2">
              <span className="w-3 h-3 rounded-full bg-[#e74c3c] animate-pulse-live"></span>
            </div>
          ) : null}
          <div className="text-3xl mb-2">🔴</div>
          <div className="stat-value text-[#e74c3c]">{liveMatchesCount || 0}</div>
          <div className="stat-label">Live Matches</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="card card-p flex flex-col">
          <h3 className="font-bold text-white mb-4 border-b border-[#1a6b3a]/30 pb-2">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4 flex-1">
            <Link href="/admin/matches?action=new" className="bg-[#0d1f13] border border-[#1a6b3a]/30 p-4 rounded-lg hover:border-[#1a6b3a] hover:bg-[#162b1c] transition-all group flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📅</span>
              <span className="font-bold text-sm text-[#d4a017]">Schedule Match</span>
            </Link>
            <Link href="/admin/teams?action=new" className="bg-[#0d1f13] border border-[#1a6b3a]/30 p-4 rounded-lg hover:border-[#1a6b3a] hover:bg-[#162b1c] transition-all group flex flex-col items-center justify-center text-center">
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">➕</span>
              <span className="font-bold text-sm text-[#d4a017]">Add Team</span>
            </Link>
            <Link href="/admin/announcements?action=new" className="bg-[#0d1f13] border border-[#1a6b3a]/30 p-4 rounded-lg hover:border-[#1a6b3a] hover:bg-[#162b1c] transition-all group flex flex-col items-center justify-center text-center col-span-2">
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📢</span>
              <span className="font-bold text-sm text-[#d4a017]">Post Announcement</span>
            </Link>
          </div>
        </div>

        {/* Recent Matches */}
        <div className="card card-p">
          <div className="flex items-center justify-between mb-4 border-b border-[#1a6b3a]/30 pb-2">
            <h3 className="font-bold text-white">Recent Matches</h3>
            <Link href="/admin/matches" className="text-xs font-bold text-[#1a6b3a] uppercase tracking-wider hover:text-[#d4a017]">View All</Link>
          </div>
          
          <div className="flex flex-col gap-3">
            {recentMatches && recentMatches.length > 0 ? (
              recentMatches.map(match => (
                <div key={match.id} className="bg-[#0d1f13] border border-[#1a6b3a]/20 p-3 rounded-lg flex items-center justify-between">
                  <div className="flex flex-col gap-1">
                    <div className="font-bold text-sm flex items-center gap-2">
                      <span className="text-[#d4a017]">{(match.team1 as any)?.short_name}</span>
                      <span className="text-xs text-[#8fa899] italic">vs</span>
                      <span className="text-[#d4a017]">{(match.team2 as any)?.short_name}</span>
                    </div>
                    <span className="text-xs text-[#8fa899]">
                      {new Date(match.scheduled_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {match.status === 'live' ? (
                      <Link href={`/admin/matches/${match.id}/score`} className="btn btn-sm btn-danger px-3 py-1 text-xs whitespace-nowrap">
                        Score Live
                      </Link>
                    ) : (
                      <span className={`text-xs font-bold uppercase ${
                        match.status === 'completed' ? 'text-[#4caf72]' : 
                        match.status === 'upcoming' ? 'text-[#3498db]' : 'text-[#8fa899]'
                      }`}>
                        {match.status}
                      </span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-[#8fa899] text-sm">
                No matches found.
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
