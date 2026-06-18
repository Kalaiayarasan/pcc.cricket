import { Innings, BattingPerformance, BowlingPerformance } from '@/lib/types/database';

interface ScorecardProps {
  innings: Innings;
}

export default function Scorecard({ innings }: ScorecardProps) {
  const batting = innings.batting_performances || [];
  const bowling = innings.bowling_performances || [];

  // Sort batting by position
  const sortedBatting = [...batting].sort((a, b) => (a.batting_position || 99) - (b.batting_position || 99));
  
  // Sort bowling by who bowled first (approximate by ID if no time field, usually ordered naturally)
  const sortedBowling = [...bowling];

  return (
    <div className="flex flex-col gap-6">
      {/* Innings Header */}
      <div className="flex items-center justify-between bg-[#0d1f13] p-4 rounded-lg border border-[#1a6b3a]/30">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="w-8 h-8 rounded-full bg-[#162b1c] border border-[#d4a017]/30 flex items-center justify-center font-bold text-[#d4a017] text-xs">
              {innings.batting_team?.short_name}
            </span>
            {innings.batting_team?.name} Innings
          </h3>
        </div>
        <div className="text-right">
          <div className="font-mono font-bold text-2xl text-[#d4a017]">
            {innings.total_runs}/{innings.total_wickets}
          </div>
          <div className="text-sm text-[#8fa899]">
            ({innings.total_overs} Ov)
          </div>
        </div>
      </div>

      {/* Batting Card */}
      <div className="card overflow-hidden">
        <div className="table-wrapper border-none rounded-none">
          <table className="pcc-table">
            <thead>
              <tr>
                <th>Batter</th>
                <th></th>
                <th className="text-center">R</th>
                <th className="text-center">B</th>
                <th className="text-center">4s</th>
                <th className="text-center">6s</th>
                <th className="text-right">SR</th>
              </tr>
            </thead>
            <tbody>
              {sortedBatting.map(bat => {
                const isOut = !bat.is_not_out;
                const sr = bat.balls_faced > 0 ? ((bat.runs / bat.balls_faced) * 100).toFixed(1) : '0.0';
                
                return (
                  <tr key={bat.id} className={!isOut ? 'bg-[rgba(26,107,58,0.1)]' : ''}>
                    <td className="font-bold text-white whitespace-nowrap">
                      {bat.player?.name} {!isOut && bat.player?.is_captain ? '(c)' : ''} {bat.player?.role === 'wicket-keeper' ? '(wk)' : ''}
                      {!isOut && <span className="ml-2 text-xs text-[#d4a017] font-semibold">*</span>}
                    </td>
                    <td className="text-xs text-[#8fa899] italic">
                      {bat.how_out || (bat.is_not_out ? 'not out' : '')}
                    </td>
                    <td className="text-center font-mono font-bold text-white">{bat.runs}</td>
                    <td className="text-center font-mono text-[#8fa899]">{bat.balls_faced}</td>
                    <td className="text-center font-mono text-[#3498db]">{bat.fours}</td>
                    <td className="text-center font-mono text-[#e74c3c]">{bat.sixes}</td>
                    <td className="text-right font-mono text-xs">{sr}</td>
                  </tr>
                );
              })}
              {sortedBatting.length === 0 && (
                <tr><td colSpan={7} className="text-center text-[#8fa899] py-4">No batting data</td></tr>
              )}
            </tbody>
            {/* Extras & Total */}
            <tfoot>
              <tr className="border-t border-[#1a6b3a]/30 bg-[#0d1f13]">
                <td className="font-semibold text-[#8fa899]">Extras</td>
                <td colSpan={6} className="text-left font-mono text-sm text-[#8fa899]">
                  <span className="mr-2">W {innings.extras_wide}</span>
                  <span className="mr-2">NB {innings.extras_noball}</span>
                  <span className="mr-2">B {innings.extras_bye}</span>
                  <span>LB {innings.extras_legbye}</span>
                </td>
              </tr>
              <tr className="bg-[#162b1c] border-t-2 border-[#1a6b3a]">
                <td className="font-bold text-white">Total</td>
                <td colSpan={6} className="text-left font-mono font-bold text-[#d4a017]">
                  {innings.total_runs} ({innings.total_wickets} wkts, {innings.total_overs} Ov)
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Bowling Card */}
      <div className="card overflow-hidden">
        <div className="table-wrapper border-none rounded-none">
          <table className="pcc-table">
            <thead>
              <tr>
                <th>Bowler</th>
                <th className="text-center">O</th>
                <th className="text-center">M</th>
                <th className="text-center">R</th>
                <th className="text-center">W</th>
                <th className="text-center text-xs text-[#8fa899]" title="No Balls">NB</th>
                <th className="text-center text-xs text-[#8fa899]" title="Wides">WD</th>
                <th className="text-right">ECON</th>
              </tr>
            </thead>
            <tbody>
              {sortedBowling.map(bowl => {
                const parts = bowl.overs.toString().split('.');
                const oversDec = parseInt(parts[0]) + (parts[1] ? parseInt(parts[1]) / 6 : 0);
                const econ = oversDec > 0 ? (bowl.runs_conceded / oversDec).toFixed(2) : '0.00';
                
                return (
                  <tr key={bowl.id}>
                    <td className="font-bold text-white whitespace-nowrap">{bowl.player?.name}</td>
                    <td className="text-center font-mono text-[#8fa899]">{bowl.overs}</td>
                    <td className="text-center font-mono text-[#8fa899]">{bowl.maidens}</td>
                    <td className="text-center font-mono text-white">{bowl.runs_conceded}</td>
                    <td className="text-center font-mono font-bold text-[#d4a017]">{bowl.wickets}</td>
                    <td className="text-center font-mono text-xs text-[#e67e22]">{bowl.no_balls}</td>
                    <td className="text-center font-mono text-xs text-[#e67e22]">{bowl.wides}</td>
                    <td className="text-right font-mono text-xs">{econ}</td>
                  </tr>
                );
              })}
              {sortedBowling.length === 0 && (
                <tr><td colSpan={8} className="text-center text-[#8fa899] py-4">No bowling data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
