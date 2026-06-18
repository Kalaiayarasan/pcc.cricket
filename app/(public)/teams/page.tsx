import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Team, Player } from '@/lib/types/database';

export const revalidate = 60;

export default async function TeamsPage() {
  const supabase = await createClient();

  // Fetch teams with their players and captain
  const { data: teamsData } = await supabase
    .from('teams')
    .select(`
      *,
      players(id, name, role, photo_url)
    `)
    .order('name');

  const teams = (teamsData || []) as (Team & { players: Player[] })[];

  return (
    <>
      <div className="page-header">
        <div className="container text-center">
          <h1 className="page-title">Tournament Teams</h1>
          <p className="page-subtitle">Squads participating in PCC Summer Cup</p>
        </div>
      </div>

      <section className="section pt-0">
        <div className="container">
          {teams.length > 0 ? (
            <div className="grid-3">
              {teams.map((team) => {
                const captain = team.players?.find(p => p.id === team.captain_id);
                
                return (
                  <Link href={`/teams/${team.id}`} key={team.id} className="card card-p block hover:scale-[1.02] transition-transform">
                    <div className="flex items-center gap-4 mb-4 border-b border-[#1a6b3a]/30 pb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1a6b3a] to-[#0d1f13] border-2 border-[#d4a017]/50 flex items-center justify-center font-black text-2xl text-[#d4a017] shadow-gold">
                        {team.short_name}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">{team.name}</h3>
                        <p className="text-sm text-[#8fa899]">Home: {team.home_ground || 'N/A'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <div className="avatar avatar-sm">
                          {captain?.name?.substring(0, 2).toUpperCase() || 'C'}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-[#8fa899] uppercase tracking-wider">Captain</span>
                          <span className="text-sm font-semibold">{captain?.name || 'Not assigned'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-mono font-bold text-[#d4a017]">{team.players?.length || 0}</span>
                        <div className="text-xs text-[#8fa899] uppercase">Players</div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="card card-p-lg text-center">
              <div className="text-4xl mb-4">🛡️</div>
              <h3 className="text-xl font-bold mb-2">No Teams Found</h3>
              <p className="text-[#8fa899]">Teams have not been added to the tournament yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
