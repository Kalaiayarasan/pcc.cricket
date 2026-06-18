import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Match, PointsTableEntry, Announcement } from '@/lib/types/database';

export const revalidate = 60; // Revalidate every minute

export default async function HomePage() {
  const supabase = await createClient();

  // Fetch Live Matches
  const { data: liveMatchesData } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name, short_name, logo_url),
      team2:teams!matches_team2_id_fkey(name, short_name, logo_url)
    `)
    .eq('status', 'live')
    .order('scheduled_at', { ascending: true })
    .limit(2);

  const liveMatches = (liveMatchesData || []) as Match[];

  // Fetch Upcoming Matches
  const { data: upcomingMatchesData } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name, short_name, logo_url),
      team2:teams!matches_team2_id_fkey(name, short_name, logo_url)
    `)
    .eq('status', 'upcoming')
    .order('scheduled_at', { ascending: true })
    .limit(3);
    
  const upcomingMatches = (upcomingMatchesData || []) as Match[];

  // Fetch Points Table preview
  const { data: pointsTableData } = await supabase
    .from('points_table')
    .select(`
      *,
      team:teams!points_table_team_id_fkey(name, short_name)
    `)
    .order('points', { ascending: false })
    .limit(4);
    
  const pointsTable = (pointsTableData || []) as PointsTableEntry[];

  // Fetch Pinned Announcements
  const { data: announcementsData } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_pinned', true)
    .order('created_at', { ascending: false });
    
  const pinnedAnnouncements = (announcementsData || []) as Announcement[];

  return (
    <>
      {/* Hero Section */}
      <section className="hero">
        <div className="container relative z-10">
          <div className="flex flex-col items-center text-center">
            <h1 className="text-5xl md:text-6xl font-black mb-4">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-[#d4a017]">PCC 2026</span>
            </h1>
            <p className="text-xl text-[#8fa899] max-w-2xl mb-10">
              Experience the thrill of village cricket with live scores, real-time updates, and complete tournament statistics.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link href="/live" className="btn btn-primary btn-lg">
                <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse-live"></span>
                View Live Matches
              </Link>
              <Link href="/points-table" className="btn btn-outline-gold btn-lg">
                Tournament Standings
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Announcements Banner */}
      {pinnedAnnouncements.length > 0 && (
        <div className="container mt-8 mb-12">
          {pinnedAnnouncements.map((announcement) => (
            <div key={announcement.id} className="announcement-banner mb-4">
              <span className="announcement-pin">📌</span>
              <div>
                <h4 className="text-[#d4a017] font-bold text-sm">{announcement.title}</h4>
                <p className="text-[#8fa899] text-sm">{announcement.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <section className="section bg-gradient-to-b from-[#0d1f13] to-[#061409]">
          <div className="container">
            <div className="flex items-center justify-between mb-8">
              <h2 className="section-title mb-0">Live Action</h2>
              <Link href="/live" className="text-[#1a6b3a] hover:text-[#d4a017] text-sm font-bold tracking-widest uppercase transition-colors">
                All Live →
              </Link>
            </div>
            <div className="grid-2">
              {liveMatches.map((match) => (
                <div key={match.id} className="match-card match-live">
                  <div className="flex items-center justify-between border-b border-[#1a6b3a]/30 pb-3 mb-4">
                    <span className="badge badge-live">● LIVE</span>
                    <span className="text-xs text-[#8fa899] font-mono">{match.venue}</span>
                  </div>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#162b1c] border border-[#d4a017]/30 flex items-center justify-center font-bold text-[#d4a017]">
                          {match.team1?.short_name}
                        </div>
                        <span className="font-bold text-lg">{match.team1?.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-xl">--/--</div>
                        <div className="text-xs text-[#8fa899]">(0.0)</div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#162b1c] border border-[#d4a017]/30 flex items-center justify-center font-bold text-[#d4a017]">
                          {match.team2?.short_name}
                        </div>
                        <span className="font-bold text-lg">{match.team2?.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-mono font-bold text-xl text-[#8fa899]">Yet to bat</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-5 pt-3 border-t border-[#1a6b3a]/30 text-center">
                    <Link href={`/matches/${match.id}`} className="btn btn-outline btn-sm w-full">
                      View Scorecard
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Main Content Grid */}
      <section className="section bg-[#061409]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Matches */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title mb-0">Upcoming Matches</h2>
                <Link href="/upcoming" className="text-[#1a6b3a] hover:text-[#d4a017] text-sm font-bold tracking-widest uppercase transition-colors">
                  View Schedule →
                </Link>
              </div>
              
              {upcomingMatches.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {upcomingMatches.map((match) => (
                    <div key={match.id} className="card card-p flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex flex-col text-center md:text-left">
                        <span className="text-[#8fa899] text-xs font-mono uppercase tracking-widest mb-1">
                          {new Date(match.scheduled_at).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                        </span>
                        <span className="text-[#8fa899] text-xs">{match.venue}</span>
                      </div>
                      <div className="flex items-center gap-4 text-center">
                        <div className="w-24 font-bold text-right">{match.team1?.short_name}</div>
                        <div className="w-8 h-8 rounded-full bg-[#162b1c] text-[#d4a017] flex items-center justify-center font-bold text-xs italic">VS</div>
                        <div className="w-24 font-bold text-left">{match.team2?.short_name}</div>
                      </div>
                      <Link href={`/matches/${match.id}`} className="btn btn-outline-gold btn-sm w-full md:w-auto">
                        Match Center
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="card card-p text-center text-[#8fa899]">No upcoming matches scheduled.</div>
              )}
            </div>

            {/* Points Table Preview */}
            <div className="lg:col-span-1">
              <div className="flex items-center justify-between mb-6">
                <h2 className="section-title mb-0">Standings</h2>
                <Link href="/points-table" className="text-[#1a6b3a] hover:text-[#d4a017] text-sm font-bold tracking-widest uppercase transition-colors">
                  Full Table →
                </Link>
              </div>
              
              <div className="card overflow-hidden">
                <div className="table-wrapper border-none rounded-none">
                  <table className="pcc-table">
                    <thead>
                      <tr>
                        <th>Team</th>
                        <th className="text-center">P</th>
                        <th className="text-center">Pts</th>
                        <th className="text-right">NRR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pointsTable.map((entry, index) => (
                        <tr key={entry.id} className={index < 4 ? 'highlight-row' : ''}>
                          <td className="font-bold flex items-center gap-2">
                            <span className="w-4 text-xs text-[#8fa899]">{index + 1}</span>
                            {entry.team?.short_name}
                          </td>
                          <td className="text-center font-mono">{entry.matches_played}</td>
                          <td className="text-center font-mono font-bold text-[#d4a017]">{entry.points}</td>
                          <td className="text-right font-mono text-xs">{entry.nrr.toFixed(2)}</td>
                        </tr>
                      ))}
                      {pointsTable.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center text-[#8fa899] py-4">No data available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
