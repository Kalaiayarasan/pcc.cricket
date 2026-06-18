import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Match, Innings, Delivery, Player } from '@/lib/types/database';
import ScoringPanel from './ScoringPanel';
import BallTimeline from '@/components/scoring/BallTimeline';

export const revalidate = 0;

export default async function MatchScoringPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch full match data
  const { data: matchData } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(id, name, short_name),
      team2:teams!matches_team2_id_fkey(id, name, short_name)
    `)
    .eq('id', id)
    .single();

  if (!matchData) notFound();
  const match = matchData as Match;

  // Fetch Innings
  const { data: inningsData } = await supabase
    .from('innings')
    .select('*')
    .eq('match_id', id)
    .order('inning_number', { ascending: true });

  const inningsList = (inningsData || []) as Innings[];
  const currentInnings = inningsList.find(i => !i.is_completed) || inningsList[inningsList.length - 1];

  // Fetch Deliveries for current innings
  let deliveries: Delivery[] = [];
  if (currentInnings) {
    const { data: deliveriesData } = await supabase
      .from('deliveries')
      .select('*')
      .eq('innings_id', currentInnings.id)
      .order('created_at', { ascending: false });
    deliveries = (deliveriesData || []) as Delivery[];
  }

  // Fetch Players for both teams
  const { data: playersData } = await supabase
    .from('players')
    .select('*')
    .in('team_id', [match.team1_id, match.team2_id]);

  const allPlayers = (playersData || []) as Player[];
  
  // Determine batting and bowling players
  let battingPlayers: Player[] = [];
  let bowlingPlayers: Player[] = [];
  
  if (currentInnings) {
    battingPlayers = allPlayers.filter(p => p.team_id === currentInnings.batting_team_id);
    bowlingPlayers = allPlayers.filter(p => p.team_id === currentInnings.bowling_team_id);
  }

  // Simplified logic for current striker/bowler based on recent deliveries (or null if new innings)
  const currentStrikerId = deliveries.length > 0 ? deliveries[0].batsman_id : (battingPlayers[0]?.id || null);
  const currentNonStrikerId = deliveries.length > 0 ? deliveries[0].non_striker_id : (battingPlayers[1]?.id || null);
  const currentBowlerId = deliveries.length > 0 ? deliveries[0].bowler_id : (bowlingPlayers[0]?.id || null);

  if (match.status !== 'live') {
    return (
      <div className="card card-p-lg text-center mt-10">
        <h2 className="text-2xl font-bold mb-4">Match Not Live</h2>
        <p className="text-[#8fa899]">You can only score live matches. Please update the match status to Live first.</p>
      </div>
    );
  }

  if (!currentInnings) {
    return (
      <div className="card card-p-lg text-center mt-10">
        <h2 className="text-2xl font-bold mb-4">No Innings Started</h2>
        <p className="text-[#8fa899]">Please start an innings to begin scoring.</p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#e74c3c] animate-pulse-live"></span>
            Live Scoring: {match.team1?.short_name} vs {match.team2?.short_name}
          </h1>
          <p className="text-[#8fa899] text-sm">
            Innings {currentInnings.inning_number} • {currentInnings.total_runs}/{currentInnings.total_wickets} ({currentInnings.total_overs} Ov)
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <ScoringPanel 
            match={match}
            innings={currentInnings}
            deliveries={deliveries}
            battingPlayers={battingPlayers}
            bowlingPlayers={bowlingPlayers}
            currentStrikerId={currentStrikerId}
            currentNonStrikerId={currentNonStrikerId}
            currentBowlerId={currentBowlerId}
          />
        </div>
        
        <div className="lg:col-span-1">
          <div className="card card-p h-full max-h-[600px] overflow-y-auto">
            <h3 className="font-bold text-white mb-4 border-b border-[#1a6b3a]/30 pb-2">Recent Deliveries</h3>
            <BallTimeline deliveries={deliveries} limit={18} />
          </div>
        </div>
      </div>
    </>
  );
}
