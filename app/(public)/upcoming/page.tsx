import { createClient } from '@/lib/supabase/server';
import { Match } from '@/lib/types/database';
import MatchCard from '@/components/matches/MatchCard';

export const revalidate = 60;

export default async function UpcomingMatchesPage() {
  const supabase = await createClient();

  const { data: matchesData } = await supabase
    .from('matches')
    .select(`
      *,
      team1:teams!matches_team1_id_fkey(name, short_name, logo_url),
      team2:teams!matches_team2_id_fkey(name, short_name, logo_url)
    `)
    .eq('status', 'upcoming')
    .order('scheduled_at', { ascending: true });

  const matches = (matchesData || []) as Match[];

  return (
    <>
      <div className="page-header">
        <div className="container text-center">
          <h1 className="page-title">Upcoming Matches</h1>
          <p className="page-subtitle">Tournament schedule and fixtures</p>
        </div>
      </div>

      <section className="section pt-0">
        <div className="container">
          {matches.length > 0 ? (
            <div className="grid-3">
              {matches.map((match) => (
                <MatchCard key={match.id} match={match} />
              ))}
            </div>
          ) : (
            <div className="card card-p-lg text-center">
              <div className="text-4xl mb-4">📅</div>
              <h3 className="text-xl font-bold mb-2">No Upcoming Matches</h3>
              <p className="text-[#8fa899]">There are no scheduled matches at this time.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
