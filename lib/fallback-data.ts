export type FallbackTournament = {
  id: string;
  name: string;
  season?: string;
  start_date?: string;
  format?: string;
  status?: string;
};

export type FallbackTeam = {
  id: string;
  name: string;
  short_name: string;
  home_ground?: string | null;
  tournament_id: string;
  created_at: string;
};

export type FallbackPlayer = {
  id: string;
  name: string;
  team_id: string;
  role: string;
  jersey_number?: number | null;
  is_captain?: boolean;
  created_at: string;
};

export type FallbackMatch = {
  id: string;
  tournament_id: string;
  team1_id?: string;
  team2_id?: string;
  team1_name?: string;
  team2_name?: string;
  venue?: string | null;
  scheduled_at: string;
  status: string;
  total_overs?: number;
  created_at: string;
};

export type FallbackAnnouncement = {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
};

export type FallbackData = {
  tournaments: FallbackTournament[];
  teams: FallbackTeam[];
  players: FallbackPlayer[];
  matches: FallbackMatch[];
  announcements: FallbackAnnouncement[];
};

const FALLBACK_STORAGE_KEY = 'pcc_cricket_fallback_data_v1';

export function getDefaultFallbackData(): FallbackData {
  const now = new Date().toISOString();
  return {
    tournaments: [
      {
        id: 'fallback-tournament-1',
        name: 'PCC Season 2026',
        season: '2026',
        start_date: now.slice(0, 10),
        format: 'T10',
        status: 'upcoming',
      },
    ],
    teams: [
      {
        id: 'fallback-team-1',
        name: 'PCC Tigers',
        short_name: 'TGR',
        home_ground: 'PCC Ground',
        tournament_id: 'fallback-tournament-1',
        created_at: now,
      },
      {
        id: 'fallback-team-2',
        name: 'PCC Panthers',
        short_name: 'PNR',
        home_ground: 'PCC Ground',
        tournament_id: 'fallback-tournament-1',
        created_at: now,
      },
    ],
    players: [
      {
        id: 'fallback-player-1',
        name: 'Ravi Kumar',
        team_id: 'fallback-team-1',
        role: 'batsman',
        jersey_number: 7,
        is_captain: true,
        created_at: now,
      },
      {
        id: 'fallback-player-2',
        name: 'Arun Dev',
        team_id: 'fallback-team-2',
        role: 'bowler',
        jersey_number: 18,
        is_captain: false,
        created_at: now,
      },
    ],
    matches: [
      {
        id: 'fallback-match-1',
        tournament_id: 'fallback-tournament-1',
        team1_id: 'fallback-team-1',
        team2_id: 'fallback-team-2',
        team1_name: 'PCC Tigers',
        team2_name: 'PCC Panthers',
        venue: 'PCC Ground',
        scheduled_at: new Date(Date.now() + 86400000).toISOString(),
        status: 'upcoming',
        total_overs: 10,
        created_at: now,
      },
    ],
    announcements: [
      {
        id: 'fallback-announcement-1',
        title: 'Welcome to PCC Admin',
        content: 'Use the admin panel to manage teams, players, matches, and announcements.',
        is_pinned: true,
        created_at: now,
      },
    ],
  };
}

export function getFallbackData(): FallbackData {
  if (typeof window === 'undefined') {
    return getDefaultFallbackData();
  }

  try {
    const saved = window.localStorage.getItem(FALLBACK_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as Partial<FallbackData>;
      return {
        tournaments: parsed.tournaments || getDefaultFallbackData().tournaments,
        teams: parsed.teams || getDefaultFallbackData().teams,
        players: parsed.players || getDefaultFallbackData().players,
        matches: parsed.matches || getDefaultFallbackData().matches,
        announcements: parsed.announcements || getDefaultFallbackData().announcements,
      };
    }
  } catch {
    // ignore malformed storage and fall back to defaults
  }

  return getDefaultFallbackData();
}

export function saveFallbackData(data: FallbackData) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(FALLBACK_STORAGE_KEY, JSON.stringify(data));
}

export function resetFallbackData() {
  const defaultData = getDefaultFallbackData();
  saveFallbackData(defaultData);
  return defaultData;
}
