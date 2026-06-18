import { Innings, Delivery } from '@/lib/types/database';

/**
 * Convert over number + ball number into display string e.g. "4.3"
 */
export function formatOver(overNumber: number, ballNumber: number): string {
  return `${overNumber}.${ballNumber}`;
}

/**
 * Convert total legal balls bowled into overs display e.g. 23 balls → "3.5"
 */
export function ballsToOvers(balls: number): string {
  const overs = Math.floor(balls / 6);
  const remaining = balls % 6;
  return `${overs}.${remaining}`;
}

/**
 * Calculate Current Run Rate
 */
export function calculateCRR(runs: number, balls: number): number {
  if (balls === 0) return 0;
  const overs = balls / 6;
  return parseFloat((runs / overs).toFixed(2));
}

/**
 * Calculate Required Run Rate
 */
export function calculateRRR(
  targetRuns: number,
  currentRuns: number,
  totalOvers: number,
  ballsBowled: number
): number {
  const runsNeeded = targetRuns - currentRuns;
  const ballsLeft = totalOvers * 6 - ballsBowled;
  if (ballsLeft <= 0 || runsNeeded <= 0) return 0;
  const oversLeft = ballsLeft / 6;
  return parseFloat((runsNeeded / oversLeft).toFixed(2));
}

/**
 * Get count of legal balls in an innings (excludes wides and no-balls)
 */
export function getLegalBalls(deliveries: Delivery[]): number {
  return deliveries.filter(d => d.extra_type !== 'wide' && d.extra_type !== 'noball').length;
}

/**
 * Get total runs from deliveries
 */
export function getTotalRuns(deliveries: Delivery[]): number {
  return deliveries.reduce((sum, d) => sum + d.runs_batsman + d.runs_extra, 0);
}

/**
 * Get wickets count from deliveries
 */
export function getWickets(deliveries: Delivery[]): number {
  return deliveries.filter(d => d.is_wicket).length;
}

/**
 * Group deliveries by over
 */
export function groupByOver(deliveries: Delivery[]): Map<number, Delivery[]> {
  const map = new Map<number, Delivery[]>();
  deliveries.forEach(d => {
    if (!map.has(d.over_number)) {
      map.set(d.over_number, []);
    }
    map.get(d.over_number)!.push(d);
  });
  return map;
}

/**
 * Get runs in a specific over
 */
export function getRunsInOver(deliveries: Delivery[], overNumber: number): number {
  return deliveries
    .filter(d => d.over_number === overNumber)
    .reduce((sum, d) => sum + d.runs_batsman + d.runs_extra, 0);
}

/**
 * Determine ball display color class
 */
export function getBallClass(delivery: Delivery): string {
  if (delivery.is_wicket) return 'ball-wicket';
  if (delivery.extra_type === 'wide') return 'ball-wide';
  if (delivery.extra_type === 'noball') return 'ball-noball';
  if (delivery.runs_batsman === 6) return 'ball-six';
  if (delivery.runs_batsman === 4) return 'ball-four';
  if (delivery.runs_batsman === 0) return 'ball-dot';
  return 'ball-run';
}

/**
 * Display label for a delivery on the ball timeline
 */
export function getBallLabel(delivery: Delivery): string {
  if (delivery.is_wicket) return 'W';
  if (delivery.extra_type === 'wide') return `Wd${delivery.runs_extra > 1 ? '+' + (delivery.runs_extra - 1) : ''}`;
  if (delivery.extra_type === 'noball') return `Nb${delivery.runs_batsman > 0 ? '+' + delivery.runs_batsman : ''}`;
  if (delivery.extra_type === 'bye') return `B${delivery.runs_extra}`;
  if (delivery.extra_type === 'legbye') return `Lb${delivery.runs_extra}`;
  return String(delivery.runs_batsman);
}

/**
 * Format strike rate
 */
export function formatSR(runs: number, balls: number): string {
  if (balls === 0) return '-';
  return ((runs / balls) * 100).toFixed(1);
}

/**
 * Format economy rate
 */
export function formatEconomy(runs: number, oversStr: string): string {
  const parts = oversStr.split('.');
  const overs = parseInt(parts[0]) + (parseInt(parts[1] || '0') / 6);
  if (overs === 0) return '-';
  return (runs / overs).toFixed(2);
}

/**
 * Check if innings is complete (all overs done or all out)
 */
export function isInningsComplete(innings: Innings, totalOvers: number): boolean {
  if (innings.is_completed) return true;
  if (innings.total_wickets >= 10) return true;
  const overs = innings.total_overs.split('.');
  const completedOvers = parseInt(overs[0]);
  return completedOvers >= totalOvers;
}

/**
 * Determine match result string
 */
export function getMatchResult(innings1: Innings, innings2: Innings, team1Name: string, team2Name: string): string {
  const runs1 = innings1.total_runs;
  const runs2 = innings2.total_runs;
  const wkts2 = innings2.total_wickets;

  if (runs1 === runs2) return 'Match Tied';
  if (runs2 > runs1) {
    const wicketsLeft = 10 - wkts2;
    return `${team2Name} won by ${wicketsLeft} wicket${wicketsLeft !== 1 ? 's' : ''}`;
  }
  const runDiff = runs1 - runs2;
  return `${team1Name} won by ${runDiff} run${runDiff !== 1 ? 's' : ''}`;
}
