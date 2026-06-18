import { createClient } from '@/lib/supabase/server';
import { PointsTableEntry } from '@/lib/types/database';

export const revalidate = 60;

export default async function PointsTablePage() {
  const supabase = await createClient();

  const { data: pointsTableData } = await supabase
    .from('points_table')
    .select(`
      *,
      team:teams!points_table_team_id_fkey(name, short_name, logo_url)
    `)
    .order('points', { ascending: false });

  const pointsTable = (pointsTableData || []) as PointsTableEntry[];

  return (
    <>
      <div className="page-header">
        <div className="container text-center">
          <h1 className="page-title">Points Table</h1>
          <p className="page-subtitle">Tournament standings and team rankings</p>
        </div>
      </div>

      <section className="section pt-0">
        <div className="container max-w-4xl">
          <div className="card overflow-hidden">
            <div className="table-wrapper border-none rounded-none">
              <table className="pcc-table">
                <thead>
                  <tr>
                    <th>Pos</th>
                    <th>Team</th>
                    <th className="text-center" title="Played">P</th>
                    <th className="text-center" title="Won">W</th>
                    <th className="text-center" title="Lost">L</th>
                    <th className="text-center" title="Tied">T</th>
                    <th className="text-center" title="No Result">NR</th>
                    <th className="text-center text-[#d4a017]" title="Points">Pts</th>
                    <th className="text-right" title="Net Run Rate">NRR</th>
                  </tr>
                </thead>
                <tbody>
                  {pointsTable.map((entry, index) => (
                    <tr key={entry.id} className={index < 4 ? 'highlight-row' : ''}>
                      <td className="font-mono text-[#8fa899]">{index + 1}</td>
                      <td className="font-bold flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#162b1c] border border-[#d4a017]/30 flex items-center justify-center font-bold text-[#d4a017] text-xs shadow-sm">
                          {entry.team?.short_name}
                        </div>
                        {entry.team?.name}
                      </td>
                      <td className="text-center font-mono">{entry.matches_played}</td>
                      <td className="text-center font-mono text-green-500">{entry.won}</td>
                      <td className="text-center font-mono text-red-500">{entry.lost}</td>
                      <td className="text-center font-mono text-gray-400">{entry.tied}</td>
                      <td className="text-center font-mono text-gray-400">{entry.no_result}</td>
                      <td className="text-center font-mono font-bold text-[#d4a017] text-lg">{entry.points}</td>
                      <td className="text-right font-mono text-xs">{entry.nrr.toFixed(3)}</td>
                    </tr>
                  ))}
                  {pointsTable.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center text-[#8fa899] py-8">No points table data available yet.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-[#162b1c] p-4 border-t border-[#1a6b3a]/30">
              <div className="flex flex-wrap items-center gap-6 text-xs text-[#8fa899]">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-[rgba(212,160,23,0.08)] border border-[rgba(212,160,23,0.3)] rounded-sm"></div>
                  <span>Top 4 qualify for playoffs</span>
                </div>
                <div><strong className="text-white">P:</strong> Played</div>
                <div><strong className="text-white">W:</strong> Won (2 pts)</div>
                <div><strong className="text-white">L:</strong> Lost (0 pts)</div>
                <div><strong className="text-white">T/NR:</strong> Tied/No Result (1 pt)</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
