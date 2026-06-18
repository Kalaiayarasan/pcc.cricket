import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Team, Player, Match } from '@/lib/types/database';
import MatchCard from '@/components/matches/MatchCard';

export const revalidate = 60;

export default async function TeamProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch Team details
  const { data: teamData } = await supabase
    .from('teams')
    .select(`
      *,
      players(*)
    `)
    .eq('id', id)
    .single();

  if (!teamData) {
    notFound();
  }

  const team = teamData as Team & { players: Player[] };
  const captain = team.players?.find(p => p.id === team.captain_id);
  const players = team.players?.sort((a, b) => a.name.localeCompare(b.name)) || [];

  // Fetch Recent Matches for this team
  const { data: matchesData } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name, short_name, logo_url),
      team2:teams!matches_team2_id_fkey(name, short_name, logo_url)
    `)
    .or(`team1_id.eq.${id},team2_id.eq.${id}`)
    .order('scheduled_at', { ascending: false })
    .limit(5);

  const matches = (matchesData || []) as Match[];

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'batsman': return '🏏';
      case 'bowler': return '⚾';
      case 'all-rounder': return '⚡';
      case 'wicket-keeper': return '🧤';
      default: return '👤';
    }
  };

  return (
    <>
      <div className="page-header pb-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10">
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-[#1a6b3a] to-[#0d1f13] border-4 border-[#d4a017]/50 flex items-center justify-center font-black text-5xl md:text-7xl text-[#d4a017] shadow-gold flex-shrink-0">
              {team.short_name}
            </div>
            
            <div className="flex flex-col text-center md:text-left pt-2">
              <h1 className="text-4xl md:text-5xl font-black mb-2 text-white">{team.name}</h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 md:gap-6 text-[#8fa899] mb-6">
                <div className="flex items-center gap-2">
                  <span>🏟️</span> <span>{team.home_ground || 'No Home Ground'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span>👥</span> <span>{players.length} Players</span>
                </div>
                {captain && (
                  <div className="flex items-center gap-2">
                    <span className="badge badge-gold">Captain: {captain.name}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-4 justify-center md:justify-start">
                <div className="stat-card p-4 min-w-[100px]">
                  <div className="stat-value">{matches.length}</div>
                  <div className="stat-label">Matches</div>
                </div>
                {/* Could add more stats here if aggregated */}
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section bg-[#061409]">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            
            {/* Squad List */}
            <div className="lg:col-span-2">
              <h2 className="section-title">Team Squad</h2>
              
              <div className="card overflow-hidden">
                <div className="table-wrapper border-none rounded-none">
                  <table className="pcc-table">
                    <thead>
                      <tr>
                        <th>Player</th>
                        <th className="text-center">Role</th>
                        <th className="text-center">Jersey</th>
                        <th className="text-right">Bat/Bowl Style</th>
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((player) => (
                        <tr key={player.id}>
                          <td>
                            <Link href={`/players/${player.id}`} className="font-bold flex items-center gap-3 hover:text-[#d4a017] transition-colors">
                              <div className="w-8 h-8 rounded-full bg-[#162b1c] flex items-center justify-center font-bold text-[#d4a017] text-xs">
                                {player.photo_url ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={player.photo_url} alt={player.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  player.name.substring(0, 1).toUpperCase()
                                )}
                              </div>
                              {player.name}
                              {player.is_captain && <span className="text-[0.65rem] bg-[#d4a017] text-[#061409] px-1.5 rounded-sm font-bold uppercase ml-1">C</span>}
                            </Link>
                          </td>
                          <td className="text-center">
                            <span className="inline-flex items-center gap-1 text-sm bg-[#0d1f13] px-2 py-1 rounded-md border border-[#1a6b3a]/20">
                              {getRoleIcon(player.role)} <span className="capitalize">{player.role.replace('-', ' ')}</span>
                            </span>
                          </td>
                          <td className="text-center font-mono font-bold text-[#d4a017]">{player.jersey_number || '-'}</td>
                          <td className="text-right text-xs text-[#8fa899]">
                            {player.batting_style && <div className="capitalize">{player.batting_style.replace('-', ' ')} bat</div>}
                            {player.bowling_style && <div className="capitalize mt-0.5">{player.bowling_style.replace(/-/g, ' ')}</div>}
                          </td>
                        </tr>
                      ))}
                      {players.length === 0 && (
                        <tr>
                          <td colSpan={4} className="text-center text-[#8fa899] py-8">No players added to this team yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Matches */}
            <div className="lg:col-span-1">
              <h2 className="section-title">Recent Matches</h2>
              <div className="flex flex-col gap-4">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
                {matches.length === 0 && (
                  <div className="card card-p text-center text-[#8fa899]">
                    No matches played by this team yet.
                  </div>
                )}
                <div className="text-center mt-2">
                  <Link href="/results" className="text-[#1a6b3a] hover:text-[#d4a017] text-sm font-bold tracking-widest uppercase transition-colors">
                    View All Results →
                  </Link>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </>
  );
}
