'use client';

import { useState } from 'react';
import { Match, Innings, Delivery, Player } from '@/lib/types/database';
import { createClient } from '@/lib/supabase/client';

interface ScoringPanelProps {
  match: Match;
  innings: Innings;
  deliveries: Delivery[];
  battingPlayers: Player[];
  bowlingPlayers: Player[];
  currentStrikerId: string | null;
  currentNonStrikerId: string | null;
  currentBowlerId: string | null;
}

export default function ScoringPanel({
  match,
  innings,
  deliveries,
  battingPlayers,
  bowlingPlayers,
  currentStrikerId,
  currentNonStrikerId,
  currentBowlerId,
}: ScoringPanelProps) {
  const [loading, setLoading] = useState(false);
  const [runs, setRuns] = useState<number>(0);
  const [extraType, setExtraType] = useState<'none' | 'wide' | 'noball' | 'bye' | 'legbye'>('none');
  const [isWicket, setIsWicket] = useState(false);
  
  // Calculate next ball/over number based on previous deliveries
  const legalBalls = deliveries.filter(d => d.extra_type !== 'wide' && d.extra_type !== 'noball').length;
  const currentOverNumber = Math.floor(legalBalls / 6) + 1;
  const currentBallNumber = (legalBalls % 6) + 1;

  const supabase = createClient();

  const handleRecordBall = async () => {
    if (!currentStrikerId || !currentBowlerId) {
      alert("Please select striker and bowler first.");
      return;
    }

    setLoading(true);

    try {
      // 1. Insert Delivery
      const deliveryPayload = {
        innings_id: innings.id,
        over_number: currentOverNumber,
        ball_number: currentBallNumber,
        bowler_id: currentBowlerId,
        batsman_id: currentStrikerId,
        non_striker_id: currentNonStrikerId,
        runs_batsman: ['none', 'noball'].includes(extraType) && !isWicket ? runs : 0,
        runs_extra: ['wide', 'bye', 'legbye'].includes(extraType) ? runs : (extraType === 'noball' ? 1 : 0),
        extra_type: extraType,
        is_wicket: isWicket,
        // simplify wicket type for now
        wicket_type: isWicket ? 'caught' : null, 
      };

      const { error: deliveryError } = await supabase.from('deliveries').insert([deliveryPayload]);
      
      if (deliveryError) throw deliveryError;

      // 2. We should ideally use a Postgres Function (RPC) to atomically update 
      // innings total_runs, total_wickets, total_overs and batting/bowling performances.
      // But for this scaffold, we'll do a simple client-side trigger or assume a DB trigger exists.
      
      // Reset form
      setRuns(0);
      setExtraType('none');
      setIsWicket(false);

    } catch (err) {
      console.error(err);
      alert("Failed to record delivery.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="scoring-panel">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-bold text-xl text-white">Record Delivery</h3>
          <p className="text-sm text-[#8fa899] font-mono">Over {currentOverNumber}, Ball {currentBallNumber}</p>
        </div>
        <div className="flex gap-2">
          {/* Simple state indicators */}
          {currentStrikerId && <span className="badge badge-gold">Striker Selected</span>}
          {currentBowlerId && <span className="badge badge-gold">Bowler Selected</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h4 className="text-sm font-bold text-[#8fa899] uppercase tracking-wider mb-3">Runs (Bat)</h4>
          <div className="scoring-buttons">
            {[0, 1, 2, 3, 4, 6].map(r => (
              <button 
                key={r}
                className={`run-btn ${runs === r && extraType === 'none' && !isWicket ? 'selected' : ''}`}
                onClick={() => { setRuns(r); setExtraType('none'); setIsWicket(false); }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-[#8fa899] uppercase tracking-wider mb-3">Extras & Wickets</h4>
          <div className="flex flex-wrap gap-3">
            <button 
              className={`extra-btn ${extraType === 'wide' ? 'selected-wide' : ''}`}
              onClick={() => { setExtraType('wide'); setRuns(1); setIsWicket(false); }}
            >
              Wide (Wd)
            </button>
            <button 
              className={`extra-btn ${extraType === 'noball' ? 'selected-noball' : ''}`}
              onClick={() => { setExtraType('noball'); setRuns(1); setIsWicket(false); }}
            >
              No Ball (Nb)
            </button>
            <button 
              className={`extra-btn ${extraType === 'bye' ? 'selected-bye' : ''}`}
              onClick={() => { setExtraType('bye'); setRuns(1); setIsWicket(false); }}
            >
              Bye (B)
            </button>
            <button 
              className={`extra-btn ${extraType === 'legbye' ? 'selected-legbye' : ''}`}
              onClick={() => { setExtraType('legbye'); setRuns(1); setIsWicket(false); }}
            >
              Leg Bye (Lb)
            </button>
            <button 
              className={`extra-btn ${isWicket ? 'selected-wicket' : ''}`}
              onClick={() => { setIsWicket(true); setRuns(0); setExtraType('none'); }}
            >
              WICKET (W)
            </button>
          </div>
        </div>
      </div>

      <div className="bg-[#061409] p-4 rounded-lg border border-[#1a6b3a]/30 mb-6 flex items-center justify-between">
        <div className="text-sm">
          <span className="text-[#8fa899] mr-2">Preview:</span>
          {isWicket ? (
            <span className="font-bold text-[#ff6b6b]">WICKET</span>
          ) : extraType !== 'none' ? (
            <span className="font-bold text-[#f39c12]">{runs} {extraType}</span>
          ) : (
            <span className="font-bold text-white">{runs} runs</span>
          )}
        </div>
      </div>

      <button 
        onClick={handleRecordBall}
        disabled={loading || (!currentStrikerId || !currentBowlerId)}
        className="btn btn-primary btn-lg w-full"
      >
        {loading ? 'Recording...' : 'Record Delivery'}
      </button>
    </div>
  );
}
