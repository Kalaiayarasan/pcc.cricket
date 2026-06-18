import Link from 'next/link';
import { Match, Innings } from '@/lib/types/database';

interface MatchCardProps {
  match: Match;
  innings1?: Innings;
  innings2?: Innings;
}

export default function MatchCard({ match, innings1, innings2 }: MatchCardProps) {
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';
  const isUpcoming = match.status === 'upcoming';
  
  const getBadgeClass = () => {
    if (isLive) return 'badge-live';
    if (isCompleted) return 'badge-completed';
    if (isUpcoming) return 'badge-upcoming';
    return 'badge-abandoned';
  };

  const getStatusText = () => {
    if (isLive) return '● LIVE';
    return match.status.toUpperCase();
  };

  const formattedDate = new Date(match.scheduled_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

  return (
    <div className={`match-card ${isLive ? 'match-live' : ''}`}>
      <div className="flex items-center justify-between border-b border-[#1a6b3a]/30 pb-3 mb-4">
        <span className={`badge ${getBadgeClass()}`}>{getStatusText()}</span>
        <span className="text-xs text-[#8fa899] font-mono">{formattedDate}</span>
      </div>

      <div className="flex flex-col gap-4">
        {/* Team 1 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#162b1c] border border-[#d4a017]/30 flex items-center justify-center font-bold text-[#d4a017] shadow-sm">
              {match.team1?.short_name}
            </div>
            <span className="font-bold text-lg">{match.team1?.name}</span>
          </div>
          <div className="text-right">
            {innings1 ? (
              <>
                <div className="font-mono font-bold text-xl">{innings1.total_runs}/{innings1.total_wickets}</div>
                <div className="text-xs text-[#8fa899]">({innings1.total_overs})</div>
              </>
            ) : (
              <div className="font-mono font-bold text-xl text-[#8fa899]">--/--</div>
            )}
          </div>
        </div>

        {/* Team 2 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#162b1c] border border-[#d4a017]/30 flex items-center justify-center font-bold text-[#d4a017] shadow-sm">
              {match.team2?.short_name}
            </div>
            <span className="font-bold text-lg">{match.team2?.name}</span>
          </div>
          <div className="text-right">
            {innings2 ? (
              <>
                <div className="font-mono font-bold text-xl">{innings2.total_runs}/{innings2.total_wickets}</div>
                <div className="text-xs text-[#8fa899]">({innings2.total_overs})</div>
              </>
            ) : (
              <div className="font-mono font-bold text-xl text-[#8fa899]">{isCompleted || isLive ? '--/--' : 'Yet to bat'}</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 pt-3 border-t border-[#1a6b3a]/30">
        <p className="text-sm font-semibold text-[#d4a017] text-center mb-4">
          {match.result || (isLive ? 'Match in progress' : `Match starts at ${formattedDate}`)}
        </p>
        <Link href={`/matches/${match.id}`} className="btn btn-outline btn-sm w-full">
          View Match Center
        </Link>
      </div>
    </div>
  );
}
