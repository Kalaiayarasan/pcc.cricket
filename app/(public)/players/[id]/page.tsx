import Link from 'next/link';
import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Player, Team, BattingPerformance, BowlingPerformance } from '@/lib/types/database';

export const revalidate = 60;

export default async function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch Player details
  const { data: playerData } = await supabase
    .from('players')
    .select(`
      *,
      team:teams!players_team_id_fkey(*)
    `)
    .eq('id', id)
    .single();

  if (!playerData) {
    notFound();
  }

  const player = playerData as Player & { team: Team };

  // Fetch Batting Stats
  const { data: battingData } = await supabase
    .from('batting_performances')
    .select('*')
    .eq('player_id', id);
    
  const battingStats = (battingData || []) as BattingPerformance[];
  
  // Fetch Bowling Stats
  const { data: bowlingData } = await supabase
    .from('bowling_performances')
    .select('*')
    .eq('player_id', id);
    
  const bowlingStats = (bowlingData || []) as BowlingPerformance[];

  // Calculate Aggregated Stats
  const totalMatches = Math.max(
    new Set(battingStats.map(b => b.innings_id)).size,
    new Set(bowlingStats.map(b => b.innings_id)).size
  );
  
  const totalRuns = battingStats.reduce((sum, b) => sum + b.runs, 0);
  const totalBallsFaced = battingStats.reduce((sum, b) => sum + b.balls_faced, 0);
  const totalFours = battingStats.reduce((sum, b) => sum + b.fours, 0);
  const totalSixes = battingStats.reduce((sum, b) => sum + b.sixes, 0);
  const highestScore = battingStats.length > 0 ? Math.max(...battingStats.map(b => b.runs)) : 0;
  
  const totalWickets = bowlingStats.reduce((sum, b) => sum + b.wickets, 0);
  const totalRunsConceded = bowlingStats.reduce((sum, b) => sum + b.runs_conceded, 0);
  
  // Calculate overs
  let totalBallsBowled = 0;
  bowlingStats.forEach(b => {
    const parts = b.overs.toString().split('.');
    totalBallsBowled += (parseInt(parts[0]) * 6) + (parts[1] ? parseInt(parts[1]) : 0);
  });
  const totalOversBowled = `${Math.floor(totalBallsBowled / 6)}.${totalBallsBowled % 6}`;

  const battingStrikeRate = totalBallsFaced > 0 ? ((totalRuns / totalBallsFaced) * 100).toFixed(1) : '-';
  const bowlingEconomy = totalBallsBowled > 0 ? ((totalRunsConceded / totalBallsBowled) * 6).toFixed(2) : '-';

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
            <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-[#1a6b3a] to-[#0d1f13] border-4 border-[#0d1f13] flex items-center justify-center font-black text-5xl md:text-7xl text-white shadow-lg overflow-hidden flex-shrink-0">
              {player.photo_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
              ) : (
                player.name.substring(0, 1).toUpperCase()
              )}
            </div>
            
            <div className="flex flex-col text-center md:text-left pt-2 flex-1">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                <h1 className="text-4xl md:text-5xl font-black text-white">{player.name}</h1>
                {player.jersey_number && (
                  <span className="hidden md:inline-block text-3xl font-mono font-bold text-[#d4a017] opacity-80">
                    #{player.jersey_number}
                  </span>
                )}
              </div>
              
              <Link href={`/teams/${player.team_id}`} className="inline-flex items-center justify-center md:justify-start gap-2 mb-6 hover:opacity-80 transition-opacity">
                <span className="w-6 h-6 rounded-full bg-[#162b1c] flex items-center justify-center text-[10px] font-bold text-[#d4a017] border border-[#d4a017]/30">
                  {player.team?.short_name}
                </span>
                <span className="text-[#d4a017] font-bold uppercase tracking-wider">{player.team?.name}</span>
                {player.is_captain && <span className="badge badge-gold ml-2">Captain</span>}
              </Link>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-2xl">
                <div className="bg-[#0d1f13] p-3 rounded-lg border border-[#1a6b3a]/30">
                  <div className="text-xs text-[#8fa899] mb-1">Role</div>
                  <div className="font-semibold flex items-center justify-center md:justify-start gap-1 text-sm">
                    <span>{getRoleIcon(player.role)}</span>
                    <span className="capitalize">{player.role.replace('-', ' ')}</span>
                  </div>
                </div>
                
                <div className="bg-[#0d1f13] p-3 rounded-lg border border-[#1a6b3a]/30">
                  <div className="text-xs text-[#8fa899] mb-1">Batting Style</div>
                  <div className="font-semibold text-sm capitalize">{player.batting_style?.replace('-', ' ') || '-'}</div>
                </div>
                
                <div className="bg-[#0d1f13] p-3 rounded-lg border border-[#1a6b3a]/30">
                  <div className="text-xs text-[#8fa899] mb-1">Bowling Style</div>
                  <div className="font-semibold text-sm capitalize">{player.bowling_style?.replace(/-/g, ' ') || '-'}</div>
                </div>

                <div className="bg-[#0d1f13] p-3 rounded-lg border border-[#1a6b3a]/30 md:hidden">
                  <div className="text-xs text-[#8fa899] mb-1">Jersey</div>
                  <div className="font-mono font-bold text-[#d4a017]">{player.jersey_number || '--'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section className="section bg-[#061409]">
        <div className="container max-w-5xl">
          <h2 className="section-title">Tournament Statistics</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Batting Stats */}
            <div className="card card-p">
              <div className="flex items-center gap-3 mb-6 border-b border-[#1a6b3a]/30 pb-3">
                <span className="text-2xl">🏏</span>
                <h3 className="text-xl font-bold">Batting</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0d1f13] p-4 rounded-lg border border-[#1a6b3a]/20 text-center">
                  <div className="font-mono font-bold text-3xl text-white mb-1">{totalMatches}</div>
                  <div className="text-xs text-[#8fa899] uppercase tracking-wider">Matches</div>
                </div>
                <div className="bg-[#0d1f13] p-4 rounded-lg border border-[#1a6b3a]/20 text-center">
                  <div className="font-mono font-bold text-3xl text-[#d4a017] mb-1">{totalRuns}</div>
                  <div className="text-xs text-[#8fa899] uppercase tracking-wider">Runs</div>
                </div>
                <div className="bg-[#0d1f13] p-4 rounded-lg border border-[#1a6b3a]/20 text-center">
                  <div className="font-mono font-bold text-2xl text-white mb-1">{highestScore}</div>
                  <div className="text-xs text-[#8fa899] uppercase tracking-wider">Highest</div>
                </div>
                <div className="bg-[#0d1f13] p-4 rounded-lg border border-[#1a6b3a]/20 text-center">
                  <div className="font-mono font-bold text-2xl text-white mb-1">{battingStrikeRate}</div>
                  <div className="text-xs text-[#8fa899] uppercase tracking-wider">Strike Rate</div>
                </div>
              </div>
              
              <div className="flex justify-around mt-6 pt-4 border-t border-[#1a6b3a]/20">
                <div className="text-center">
                  <div className="font-mono font-bold text-lg text-white">{totalBallsFaced}</div>
                  <div className="text-xs text-[#8fa899]">Balls</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-bold text-lg text-[#3498db]">{totalFours}</div>
                  <div className="text-xs text-[#8fa899]">Fours (4s)</div>
                </div>
                <div className="text-center">
                  <div className="font-mono font-bold text-lg text-[#e74c3c]">{totalSixes}</div>
                  <div className="text-xs text-[#8fa899]">Sixes (6s)</div>
                </div>
              </div>
            </div>

            {/* Bowling Stats */}
            <div className="card card-p">
              <div className="flex items-center gap-3 mb-6 border-b border-[#1a6b3a]/30 pb-3">
                <span className="text-2xl">⚾</span>
                <h3 className="text-xl font-bold">Bowling</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0d1f13] p-4 rounded-lg border border-[#1a6b3a]/20 text-center">
                  <div className="font-mono font-bold text-3xl text-white mb-1">{totalOversBowled}</div>
                  <div className="text-xs text-[#8fa899] uppercase tracking-wider">Overs</div>
                </div>
                <div className="bg-[#0d1f13] p-4 rounded-lg border border-[#1a6b3a]/20 text-center">
                  <div className="font-mono font-bold text-3xl text-[#d4a017] mb-1">{totalWickets}</div>
                  <div className="text-xs text-[#8fa899] uppercase tracking-wider">Wickets</div>
                </div>
                <div className="bg-[#0d1f13] p-4 rounded-lg border border-[#1a6b3a]/20 text-center">
                  <div className="font-mono font-bold text-2xl text-white mb-1">{totalRunsConceded}</div>
                  <div className="text-xs text-[#8fa899] uppercase tracking-wider">Runs Conceded</div>
                </div>
                <div className="bg-[#0d1f13] p-4 rounded-lg border border-[#1a6b3a]/20 text-center">
                  <div className="font-mono font-bold text-2xl text-white mb-1">{bowlingEconomy}</div>
                  <div className="text-xs text-[#8fa899] uppercase tracking-wider">Economy</div>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </section>
    </>
  );
}
