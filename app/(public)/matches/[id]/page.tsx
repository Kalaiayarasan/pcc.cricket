import { notFound } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { Match, Innings, Delivery, Tournament } from '@/lib/types/database';
import LiveScoreCard from '@/components/scoring/LiveScoreCard';

export const revalidate = 0; // Dynamic page to ensure fresh initial data

export default async function MatchDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch full match data
  const { data: matchData } = await supabase
    .from('matches')
    .select(`
      *,
      tournament:tournaments(name),
      team1:teams!matches_team1_id_fkey(id, name, short_name, logo_url),
      team2:teams!matches_team2_id_fkey(id, name, short_name, logo_url),
      toss_winner:teams!matches_toss_winner_id_fkey(id, name)
    `)
    .eq('id', id)
    .single();

  if (!matchData) {
    notFound();
  }

  const match = matchData as Match;

  // Fetch Innings data
  const { data: inningsData } = await supabase
    .from('innings')
    .select(`
      *,
      batting_team:teams!innings_batting_team_id_fkey(name, short_name),
      bowling_team:teams!innings_bowling_team_id_fkey(name, short_name),
      batting_performances(
        *,
        player:players!batting_performances_player_id_fkey(name, role, is_captain)
      ),
      bowling_performances(
        *,
        player:players!bowling_performances_player_id_fkey(name, role)
      )
    `)
    .eq('match_id', id)
    .order('inning_number', { ascending: true });

  const innings = (inningsData || []) as Innings[];

  // Fetch Deliveries (ball-by-ball timeline)
  let deliveries: Delivery[] = [];
  if (innings.length > 0) {
    const inningsIds = innings.map(i => i.id);
    const { data: deliveriesData } = await supabase
      .from('deliveries')
      .select(`
        *,
        bowler:players!deliveries_bowler_id_fkey(name),
        batsman:players!deliveries_batsman_id_fkey(name)
      `)
      .in('innings_id', inningsIds)
      .order('created_at', { ascending: false }); // Newest first
      
    deliveries = (deliveriesData || []) as Delivery[];
  }

  return (
    <>
      <div className="page-header pb-8 pt-10">
        <div className="container">
          <div className="text-center mb-6">
            <h1 className="page-title text-3xl md:text-4xl mb-2">Match Center</h1>
            <p className="text-[#8fa899] font-mono text-sm">
              Match ID: {match.id.substring(0, 8)}
            </p>
          </div>
        </div>
      </div>

      <section className="section bg-[#061409] pt-4 min-h-screen">
        <div className="container max-w-6xl">
          <LiveScoreCard 
            initialMatch={match}
            initialInnings={innings}
            initialDeliveries={deliveries}
          />
        </div>
      </section>
    </>
  );
}
