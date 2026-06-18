'use client';

import { Delivery } from '@/lib/types/database';
import { getBallClass, getBallLabel } from '@/lib/utils/cricket';

interface BallTimelineProps {
  deliveries: Delivery[];
  limit?: number;
}

export default function BallTimeline({ deliveries, limit = 24 }: BallTimelineProps) {
  // Sort by over_number desc, ball_number desc to get the most recent first
  const sortedDeliveries = [...deliveries].sort((a, b) => {
    if (a.over_number === b.over_number) {
      return b.ball_number - a.ball_number;
    }
    return b.over_number - a.over_number;
  });

  const recentDeliveries = sortedDeliveries.slice(0, limit);

  // Group by over for display
  const oversMap = new Map<number, Delivery[]>();
  recentDeliveries.forEach(d => {
    if (!oversMap.has(d.over_number)) {
      oversMap.set(d.over_number, []);
    }
    // Prepend to maintain correct order within the over (oldest to newest)
    oversMap.get(d.over_number)!.unshift(d);
  });

  const overNumbers = Array.from(oversMap.keys()).sort((a, b) => b - a); // Descending over numbers

  return (
    <div className="flex flex-col gap-3">
      {overNumbers.map(overNum => {
        const balls = oversMap.get(overNum) || [];
        const runsInOver = balls.reduce((sum, b) => sum + b.runs_batsman + b.runs_extra, 0);
        
        return (
          <div key={overNum} className="flex items-center gap-4 bg-[#0d1f13] p-2 rounded-lg border border-[#1a6b3a]/20">
            <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-[#1a6b3a]/30 pr-4">
              <span className="text-xs text-[#8fa899] uppercase tracking-wider font-semibold">Over</span>
              <span className="font-mono font-bold text-white text-lg">{overNum}</span>
            </div>
            
            <div className="flex-1 overflow-x-auto pb-1 scrollbar-hide">
              <div className="ball-timeline flex-nowrap">
                {balls.map(ball => (
                  <div key={ball.id} className={`ball ${getBallClass(ball)}`} title={ball.commentary || undefined}>
                    {getBallLabel(ball)}
                  </div>
                ))}
              </div>
            </div>
            
            <div className="min-w-[40px] text-right font-mono font-bold text-[#d4a017]">
              {runsInOver}
            </div>
          </div>
        );
      })}
      {overNumbers.length === 0 && (
        <div className="text-sm text-[#8fa899] italic p-2 text-center">No deliveries recorded yet.</div>
      )}
    </div>
  );
}
