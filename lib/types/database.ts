export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'abandoned';
export type TossDecision = 'bat' | 'bowl';
export type PlayerRole = 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
export type BattingStyle = 'right-hand' | 'left-hand';
export type BowlingStyle = 'right-arm-fast' | 'right-arm-medium' | 'right-arm-spin' | 'left-arm-fast' | 'left-arm-medium' | 'left-arm-spin';
export type ExtraType = 'wide' | 'noball' | 'bye' | 'legbye' | 'none';
export type WicketType = 'bowled' | 'caught' | 'lbw' | 'run-out' | 'stumped' | 'hit-wicket' | 'obstructing' | 'timed-out' | 'handled-ball';
export type TournamentStatus = 'upcoming' | 'ongoing' | 'completed';

export interface Tournament {
  id: string;
  name: string;
  season: string;
  start_date: string;
  end_date: string | null;
  format: string;
  status: TournamentStatus;
  description: string | null;
  created_at: string;
}

export interface Team {
  id: string;
  tournament_id: string;
  name: string;
  short_name: string;
  logo_url: string | null;
  captain_id: string | null;
  home_ground: string | null;
  created_at: string;
}

export interface Player {
  id: string;
  team_id: string;
  name: string;
  jersey_number: number | null;
  role: PlayerRole;
  batting_style: BattingStyle | null;
  bowling_style: BowlingStyle | null;
  photo_url: string | null;
  is_captain: boolean;
  created_at: string;
  // joined
  team?: Team;
}

export interface Match {
  id: string;
  tournament_id: string;
  team1_id: string;
  team2_id: string;
  toss_winner_id: string | null;
  toss_decision: TossDecision | null;
  batting_team_id: string | null;
  bowling_team_id: string | null;
  venue: string | null;
  scheduled_at: string;
  status: MatchStatus;
  total_overs: number;
  result: string | null;
  man_of_match_id: string | null;
  notes: string | null;
  created_at: string;
  // joined
  team1?: Team;
  team2?: Team;
  toss_winner?: Team;
  batting_team?: Team;
  bowling_team?: Team;
  man_of_match?: Player;
  innings?: Innings[];
  tournament?: Tournament;
}

export interface Innings {
  id: string;
  match_id: string;
  batting_team_id: string;
  bowling_team_id: string;
  inning_number: number;
  total_runs: number;
  total_wickets: number;
  total_overs: string;
  extras_wide: number;
  extras_noball: number;
  extras_bye: number;
  extras_legbye: number;
  is_completed: boolean;
  created_at: string;
  // joined
  batting_team?: Team;
  bowling_team?: Team;
  deliveries?: Delivery[];
  batting_performances?: BattingPerformance[];
  bowling_performances?: BowlingPerformance[];
}

export interface Delivery {
  id: string;
  innings_id: string;
  over_number: number;
  ball_number: number;
  bowler_id: string;
  batsman_id: string;
  non_striker_id: string | null;
  runs_batsman: number;
  runs_extra: number;
  extra_type: ExtraType;
  is_wicket: boolean;
  wicket_type: WicketType | null;
  fielder_id: string | null;
  dismissed_batsman_id: string | null;
  commentary: string | null;
  created_at: string;
  // joined
  bowler?: Player;
  batsman?: Player;
  non_striker?: Player;
  fielder?: Player;
  dismissed_batsman?: Player;
}

export interface BattingPerformance {
  id: string;
  innings_id: string;
  player_id: string;
  runs: number;
  balls_faced: number;
  fours: number;
  sixes: number;
  how_out: string | null;
  bowler_id: string | null;
  fielder_id: string | null;
  is_not_out: boolean;
  batting_position: number;
  // joined
  player?: Player;
  bowler?: Player;
  fielder?: Player;
}

export interface BowlingPerformance {
  id: string;
  innings_id: string;
  player_id: string;
  overs: string;
  maidens: number;
  runs_conceded: number;
  wickets: number;
  wides: number;
  no_balls: number;
  // joined
  player?: Player;
}

export interface Partnership {
  id: string;
  innings_id: string;
  batsman1_id: string;
  batsman2_id: string;
  runs: number;
  balls: number;
  wicket_number: number;
  // joined
  batsman1?: Player;
  batsman2?: Player;
}

export interface PointsTableEntry {
  id: string;
  tournament_id: string;
  team_id: string;
  matches_played: number;
  won: number;
  lost: number;
  tied: number;
  no_result: number;
  points: number;
  nrr: number;
  team?: Team;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
}

export interface LiveMatchState {
  match: Match;
  currentInnings: Innings | null;
  striker: BattingPerformance | null;
  nonStriker: BattingPerformance | null;
  currentBowler: BowlingPerformance | null;
  recentDeliveries: Delivery[];
  currentPartnership: Partnership | null;
  requiredRuns?: number;
  requiredBalls?: number;
}
