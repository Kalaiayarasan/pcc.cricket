import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Player, Team } from '@/lib/types/database';

export const revalidate = 60;

export default async function PlayersPage() {
  const supabase = await createClient();

  const { data: playersData } = await supabase
    .from('players')
    .select(`
      *,
      team:teams!players_team_id_fkey(id, name, short_name, logo_url)
    `)
    .order('name');

  const players = (playersData || []) as Player[];

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
      <div className="page-header">
        <div className="container text-center">
          <h1 className="page-title">Tournament Players</h1>
          <p className="page-subtitle">Stars of the PCC Summer Cup</p>
        </div>
      </div>

      <section className="section pt-0">
        <div className="container">
          {players.length > 0 ? (
            <div className="grid-auto">
              {players.map((player) => (
                <Link href={`/players/${player.id}`} key={player.id} className="card p-0 overflow-hidden hover:scale-[1.02] transition-transform flex flex-col">
                  <div className="h-16 bg-[#162b1c] border-b border-[#1a6b3a]/30 relative flex items-center px-4">
                    <span className="text-[#8fa899] font-bold text-sm tracking-wider uppercase flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#d4a017]"></span>
                      {player.team?.short_name}
                    </span>
                    {player.is_captain && (
                      <span className="absolute top-4 right-4 badge badge-gold">Captain</span>
                    )}
                  </div>
                  
                  <div className="flex-1 p-4 -mt-8">
                    <div className="flex items-end gap-3 mb-3">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1a6b3a] to-[#0d1f13] border-4 border-[#0d1f13] flex items-center justify-center font-black text-2xl text-white shadow-sm">
                        {player.photo_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={player.photo_url} alt={player.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          player.name.substring(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 pb-1">
                        <h3 className="text-lg font-bold text-white leading-tight">{player.name}</h3>
                        <p className="text-xs text-[#d4a017] uppercase tracking-wide">{player.team?.name}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-4 text-sm">
                      <div className="bg-[#0d1f13] p-2 rounded-md border border-[#1a6b3a]/20 text-center">
                        <div className="text-xs text-[#8fa899] mb-1">Role</div>
                        <div className="font-semibold flex items-center justify-center gap-1">
                          <span>{getRoleIcon(player.role)}</span>
                          <span className="capitalize">{player.role.replace('-', ' ')}</span>
                        </div>
                      </div>
                      <div className="bg-[#0d1f13] p-2 rounded-md border border-[#1a6b3a]/20 text-center">
                        <div className="text-xs text-[#8fa899] mb-1">Jersey</div>
                        <div className="font-mono font-bold text-[#d4a017]">{player.jersey_number || '--'}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="card card-p-lg text-center">
              <div className="text-4xl mb-4">👤</div>
              <h3 className="text-xl font-bold mb-2">No Players Found</h3>
              <p className="text-[#8fa899]">Players have not been registered yet.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
