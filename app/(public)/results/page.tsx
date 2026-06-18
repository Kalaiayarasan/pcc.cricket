import { createClient } from '@/lib/supabase/server';
import { Match } from '@/lib/types/database';
import MatchCard from '@/components/matches/MatchCard';

export const revalidate = 60;

export default async function ResultsPage() {
  const supabase = await createClient();

  const { data: matchesData } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name, short_name, logo_url),
      team2:teams!matches_team2_id_fkey(name, short_name, logo_url),
      innings:innings(
        id, match_id, inning_number, total_runs, total_wickets, total_overs, is_completed, batting_team_id
      )
    `)
    .eq('status', 'completed')
    .order('scheduled_at', { ascending: false });

  const matches = (matchesData || []) as Match[];

  return (
    <>
      <div className="page-header">
        <div className="container text-center">
          <h1 className="page-title">Match Results</h1>
          <p className="page-subtitle">Recent completed games</p>
        </div>
      </div>

      <section className="section pt-0">
        <div className="container">
          {matches.length > 0 ? (
            <div className="grid-3">
              {matches.map((match) => {
                const innings1 = match.innings?.find(i => i.inning_number === 1);
                const innings2 = match.innings?.find(i => i.inning_number === 2);
                
                return (
                  <MatchCard 
                    key={match.id} 
                    match={match} 
                    innings1={innings1} 
                    innings2={innings2} 
                  />
                );
              })}
            </div>
          ) : (
            <div className="card card-p-lg text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold mb-2">No Results Yet</h3>
              <p className="text-[#8fa899]">Completed match results will appear here.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
