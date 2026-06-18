'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Match, Innings, Delivery, BattingPerformance, BowlingPerformance } from '@/lib/types/database';
import BallTimeline from './BallTimeline';
import Scorecard from '../matches/Scorecard';
import { getMatchResult } from '@/lib/utils/cricket';

interface LiveScoreCardProps {
  initialMatch: Match;
  initialInnings: Innings[];
  initialDeliveries: Delivery[];
}

export default function LiveScoreCard({ 
  initialMatch, 
  initialInnings,
  initialDeliveries
}: LiveScoreCardProps) {
  const [match, setMatch] = useState<Match>(initialMatch);
  const [inningsList, setInningsList] = useState<Innings[]>(initialInnings);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [activeTab, setActiveTab] = useState<'live' | 'scorecard' | 'timeline'>('live');

  const supabase = createClient();
  const isLive = match.status === 'live';
  
  const currentInnings = inningsList.find(i => !i.is_completed) || inningsList[inningsList.length - 1];
  const firstInnings = inningsList.find(i => i.inning_number === 1);
  const secondInnings = inningsList.find(i => i.inning_number === 2);

  // Setup realtime subscription
  useEffect(() => {
    if (!isLive) return;

    const channel = supabase.channel(`match-${match.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches', filter: `id=eq.${match.id}` },
        (payload) => {
          setMatch((prev) => ({ ...prev, ...(payload.new as Match) }));
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'innings', filter: `match_id=eq.${match.id}` },
        (payload) => {
          setInningsList((prev) => {
            const updated = payload.new as Innings;
            // Need to refetch to get related entities (batting/bowling stats)
            // Or we can just trigger a router refresh, but for now we'll do a simple state update
            // A more robust approach would be to refetch the full innings data from an API
            const existingIndex = prev.findIndex(i => i.id === updated.id);
            if (existingIndex >= 0) {
              const newList = [...prev];
              newList[existingIndex] = { ...newList[existingIndex], ...updated };
              return newList;
            }
            return [...prev, updated];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deliveries' },
        // Need to check if the delivery belongs to our current innings
        async (payload) => {
          const newDelivery = payload.new as Delivery;
          const belongsToMatch = inningsList.some(i => i.id === newDelivery.innings_id);
          
          if (belongsToMatch) {
            // Need to fetch full delivery with joins
            const { data } = await supabase
              .from('deliveries')
              .select(`
                *,
                bowler:players!deliveries_bowler_id_fkey(name),
                batsman:players!deliveries_batsman_id_fkey(name)
              `)
              .eq('id', newDelivery.id)
              .single();
              
            if (data) {
              setDeliveries(prev => [data as Delivery, ...prev]);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [match.id, isLive, supabase, inningsList]);

  // Derived state
  const battingTeam = match.team1_id === currentInnings?.batting_team_id ? match.team1 : match.team2;
  const bowlingTeam = match.team1_id === currentInnings?.bowling_team_id ? match.team1 : match.team2;

  // Active batsmen
  const activeBatsmen = currentInnings?.batting_performances?.filter(b => b.is_not_out) || [];
  const striker = activeBatsmen.length > 0 ? activeBatsmen[0] : null; // Simplified logic
  const nonStriker = activeBatsmen.length > 1 ? activeBatsmen[1] : null;

  // Current bowler (from most recent delivery)
  const currentBowlerId = deliveries.length > 0 ? deliveries[0].bowler_id : null;
  const currentBowler = currentInnings?.bowling_performances?.find(b => b.player_id === currentBowlerId);

  // Match Status String
  let matchStatusString = match.result;
  if (isLive && firstInnings && currentInnings?.inning_number === 2) {
    const runsNeeded = firstInnings.total_runs + 1 - currentInnings.total_runs;
    const ballsLeft = (match.total_overs * 6) - 
      (parseInt(currentInnings.total_overs.split('.')[0] || '0') * 6 + parseInt(currentInnings.total_overs.split('.')[1] || '0'));
    
    if (runsNeeded > 0 && ballsLeft > 0) {
      matchStatusString = `${battingTeam?.short_name} need ${runsNeeded} runs in ${ballsLeft} balls`;
    }
  } else if (isLive) {
    matchStatusString = `${battingTeam?.name} are batting`;
  }

  // Calculate CRR/RRR
  let crr = '0.00';
  let rrr = '';
  
  if (currentInnings) {
    const parts = currentInnings.total_overs.split('.');
    const overs = parseInt(parts[0]) + (parseInt(parts[1] || '0') / 6);
    if (overs > 0) {
      crr = (currentInnings.total_runs / overs).toFixed(2);
    }
    
    if (currentInnings.inning_number === 2 && firstInnings) {
      const runsNeeded = firstInnings.total_runs + 1 - currentInnings.total_runs;
      const oversLeft = match.total_overs - overs;
      if (oversLeft > 0 && runsNeeded > 0) {
        rrr = (runsNeeded / oversLeft).toFixed(2);
      }
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Top Match Info Box */}
      <div className={`card card-p border-t-4 ${isLive ? 'border-t-[#e74c3c]' : 'border-t-[#d4a017]'}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-2">
            {isLive ? (
              <span className="badge badge-live">● LIVE</span>
            ) : (
              <span className={`badge ${match.status === 'completed' ? 'badge-completed' : 'badge-upcoming'}`}>
                {match.status.toUpperCase()}
              </span>
            )}
            <span className="text-[#8fa899] text-sm">
              {match.tournament?.name} • {match.venue}
            </span>
          </div>
          <div className="text-sm font-semibold text-[#d4a017]">
            {matchStatusString || 'Match Details'}
          </div>
        </div>

        {/* Main Score Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center py-4">
          {/* Team 1 */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-full bg-[#162b1c] border border-[#d4a017]/50 flex items-center justify-center font-bold text-[#d4a017] shadow-gold">
                {match.team1?.short_name}
              </div>
              <span className="font-bold text-xl">{match.team1?.name}</span>
            </div>
            {match.team1_id === firstInnings?.batting_team_id && (
              <div className="score-display">
                <span className="score-big">{firstInnings.total_runs}/{firstInnings.total_wickets}</span>
                <span className="score-overs ml-2">({firstInnings.total_overs})</span>
              </div>
            )}
            {match.team1_id === secondInnings?.batting_team_id && (
              <div className="score-display">
                <span className="score-big">{secondInnings.total_runs}/{secondInnings.total_wickets}</span>
                <span className="score-overs ml-2">({secondInnings.total_overs})</span>
              </div>
            )}
          </div>

          <div className="flex justify-center text-[#8fa899] font-bold italic text-lg opacity-50">VS</div>

          {/* Team 2 */}
          <div className="flex flex-col items-center md:items-end">
            <div className="flex items-center gap-3 mb-2 flex-row-reverse md:flex-row">
              <span className="font-bold text-xl">{match.team2?.name}</span>
              <div className="w-12 h-12 rounded-full bg-[#162b1c] border border-[#d4a017]/50 flex items-center justify-center font-bold text-[#d4a017] shadow-gold">
                {match.team2?.short_name}
              </div>
            </div>
            {match.team2_id === firstInnings?.batting_team_id && (
              <div className="score-display">
                <span className="score-big">{firstInnings.total_runs}/{firstInnings.total_wickets}</span>
                <span className="score-overs ml-2">({firstInnings.total_overs})</span>
              </div>
            )}
            {match.team2_id === secondInnings?.batting_team_id && (
              <div className="score-display">
                <span className="score-big">{secondInnings.total_runs}/{secondInnings.total_wickets}</span>
                <span className="score-overs ml-2">({secondInnings.total_overs})</span>
              </div>
            )}
            {!firstInnings && match.status !== 'upcoming' && (
              <div className="text-[#8fa899] font-mono">Toss: {match.toss_winner?.name} elected to {match.toss_decision}</div>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tab-list">
        <button className={`tab-btn ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')}>
          Live Action
        </button>
        <button className={`tab-btn ${activeTab === 'scorecard' ? 'active' : ''}`} onClick={() => setActiveTab('scorecard')}>
          Full Scorecard
        </button>
        <button className={`tab-btn ${activeTab === 'timeline' ? 'active' : ''}`} onClick={() => setActiveTab('timeline')}>
          Ball Timeline
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in">
        {/* LIVE TAB */}
        {activeTab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Current Play Area */}
              {currentInnings && !match.result && (
                <div className="card overflow-hidden">
                  <div className="bg-[#0d1f13] border-b border-[#1a6b3a]/30 p-3 flex justify-between items-center">
                    <h3 className="font-bold text-[#d4a017]">Currently Batting</h3>
                    <div className="flex gap-3">
                      <span className="crr-badge">CRR: {crr}</span>
                      {rrr && <span className="rrr-badge">RRR: {rrr}</span>}
                    </div>
                  </div>
                  <div className="table-wrapper border-none rounded-none">
                    <table className="pcc-table">
                      <thead>
                        <tr>
                          <th>Batter</th>
                          <th className="text-center">R</th>
                          <th className="text-center">B</th>
                          <th className="text-center">4s</th>
                          <th className="text-center">6s</th>
                          <th className="text-right">SR</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeBatsmen.map((bat, idx) => {
                          const sr = bat.balls_faced > 0 ? ((bat.runs / bat.balls_faced) * 100).toFixed(1) : '0.0';
                          return (
                            <tr key={bat.id} className={idx === 0 ? 'bg-[rgba(26,107,58,0.1)]' : ''}>
                              <td className="font-bold text-white flex items-center gap-2">
                                {bat.player?.name} 
                                {idx === 0 && <span className="text-[#e74c3c] text-xs" title="Striker">🏏</span>}
                              </td>
                              <td className="text-center font-mono font-bold text-white">{bat.runs}</td>
                              <td className="text-center font-mono text-[#8fa899]">{bat.balls_faced}</td>
                              <td className="text-center font-mono text-[#3498db]">{bat.fours}</td>
                              <td className="text-center font-mono text-[#e74c3c]">{bat.sixes}</td>
                              <td className="text-right font-mono text-xs">{sr}</td>
                            </tr>
                          );
                        })}
                        {activeBatsmen.length === 0 && (
                          <tr><td colSpan={6} className="text-center text-[#8fa899] py-4">Innings not started or all out.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {currentBowler && (
                    <>
                      <div className="bg-[#0d1f13] border-y border-[#1a6b3a]/30 p-3">
                        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Currently Bowling</h3>
                      </div>
                      <div className="table-wrapper border-none rounded-none">
                        <table className="pcc-table">
                          <thead>
                            <tr>
                              <th>Bowler</th>
                              <th className="text-center">O</th>
                              <th className="text-center">M</th>
                              <th className="text-center">R</th>
                              <th className="text-center">W</th>
                              <th className="text-right">ECON</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="font-bold text-white flex items-center gap-2">
                                {currentBowler.player?.name}
                                <span className="text-[#d4a017] text-xs" title="Current Bowler">⚾</span>
                              </td>
                              <td className="text-center font-mono text-[#8fa899]">{currentBowler.overs}</td>
                              <td className="text-center font-mono text-[#8fa899]">{currentBowler.maidens}</td>
                              <td className="text-center font-mono text-white">{currentBowler.runs_conceded}</td>
                              <td className="text-center font-mono font-bold text-[#d4a017]">{currentBowler.wickets}</td>
                              <td className="text-right font-mono text-xs">
                                {(() => {
                                  const parts = currentBowler.overs.toString().split('.');
                                  const oversDec = parseInt(parts[0]) + (parts[1] ? parseInt(parts[1]) / 6 : 0);
                                  return oversDec > 0 ? (currentBowler.runs_conceded / oversDec).toFixed(2) : '0.00';
                                })()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Right sidebar - Recent Balls */}
            <div className="lg:col-span-1">
              <div className="card card-p h-full border-[#d4a017]/30">
                <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#1a6b3a]"></span>
                  Recent Deliveries
                </h3>
                <BallTimeline deliveries={deliveries} limit={18} />
              </div>
            </div>
          </div>
        )}

        {/* SCORECARD TAB */}
        {activeTab === 'scorecard' && (
          <div className="flex flex-col gap-8">
            {firstInnings && <Scorecard innings={firstInnings} />}
            {secondInnings && <Scorecard innings={secondInnings} />}
            {!firstInnings && (
              <div className="card card-p text-center text-[#8fa899]">
                Scorecard is not available yet.
              </div>
            )}
          </div>
        )}

        {/* TIMELINE TAB */}
        {activeTab === 'timeline' && (
          <div className="card card-p-lg">
            <h3 className="text-xl font-bold mb-6 text-[#d4a017]">Full Match Timeline</h3>
            <BallTimeline deliveries={deliveries} limit={500} />
          </div>
        )}
      </div>
    </div>
  );
}
