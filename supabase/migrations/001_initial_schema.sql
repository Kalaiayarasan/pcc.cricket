-- Enable uuid-ossp extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tournaments Table
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  season VARCHAR(50) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  format VARCHAR(50) NOT NULL DEFAULT 'T10',
  status VARCHAR(50) NOT NULL CHECK (status IN ('upcoming', 'ongoing', 'completed')) DEFAULT 'upcoming',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Teams Table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(10) NOT NULL,
  logo_url TEXT,
  captain_id UUID, -- Foreign key will be added later
  home_ground VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Players Table
CREATE TABLE players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  jersey_number INTEGER,
  role VARCHAR(50) NOT NULL CHECK (role IN ('batsman', 'bowler', 'all-rounder', 'wicket-keeper')),
  batting_style VARCHAR(50) CHECK (batting_style IN ('right-hand', 'left-hand')),
  bowling_style VARCHAR(50) CHECK (bowling_style IN ('right-arm-fast', 'right-arm-medium', 'right-arm-spin', 'left-arm-fast', 'left-arm-medium', 'left-arm-spin')),
  photo_url TEXT,
  is_captain BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add foreign key constraint for captain to teams table
ALTER TABLE teams ADD CONSTRAINT fk_captain FOREIGN KEY (captain_id) REFERENCES players(id) ON DELETE SET NULL;

-- Matches Table
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  team1_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  team2_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  toss_winner_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  toss_decision VARCHAR(10) CHECK (toss_decision IN ('bat', 'bowl')),
  batting_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  bowling_team_id UUID REFERENCES teams(id) ON DELETE SET NULL,
  venue VARCHAR(255),
  scheduled_at TIMESTAMPTZ NOT NULL,
  status VARCHAR(50) NOT NULL CHECK (status IN ('upcoming', 'live', 'completed', 'abandoned')) DEFAULT 'upcoming',
  total_overs INTEGER NOT NULL DEFAULT 10,
  result TEXT,
  man_of_match_id UUID REFERENCES players(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Innings Table
CREATE TABLE innings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
  batting_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  bowling_team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  inning_number INTEGER NOT NULL CHECK (inning_number IN (1, 2)),
  total_runs INTEGER NOT NULL DEFAULT 0,
  total_wickets INTEGER NOT NULL DEFAULT 0,
  total_overs NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
  extras_wide INTEGER NOT NULL DEFAULT 0,
  extras_noball INTEGER NOT NULL DEFAULT 0,
  extras_bye INTEGER NOT NULL DEFAULT 0,
  extras_legbye INTEGER NOT NULL DEFAULT 0,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(match_id, inning_number)
);

-- Deliveries Table
CREATE TABLE deliveries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  innings_id UUID NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  over_number INTEGER NOT NULL,
  ball_number INTEGER NOT NULL,
  bowler_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  batsman_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  non_striker_id UUID REFERENCES players(id) ON DELETE SET NULL,
  runs_batsman INTEGER NOT NULL DEFAULT 0,
  runs_extra INTEGER NOT NULL DEFAULT 0,
  extra_type VARCHAR(20) NOT NULL CHECK (extra_type IN ('wide', 'noball', 'bye', 'legbye', 'none')) DEFAULT 'none',
  is_wicket BOOLEAN NOT NULL DEFAULT FALSE,
  wicket_type VARCHAR(50) CHECK (wicket_type IN ('bowled', 'caught', 'lbw', 'run-out', 'stumped', 'hit-wicket', 'obstructing', 'timed-out', 'handled-ball')),
  fielder_id UUID REFERENCES players(id) ON DELETE SET NULL,
  dismissed_batsman_id UUID REFERENCES players(id) ON DELETE SET NULL,
  commentary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Batting Performances Table
CREATE TABLE batting_performances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  innings_id UUID NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  runs INTEGER NOT NULL DEFAULT 0,
  balls_faced INTEGER NOT NULL DEFAULT 0,
  fours INTEGER NOT NULL DEFAULT 0,
  sixes INTEGER NOT NULL DEFAULT 0,
  how_out VARCHAR(255),
  bowler_id UUID REFERENCES players(id) ON DELETE SET NULL,
  fielder_id UUID REFERENCES players(id) ON DELETE SET NULL,
  is_not_out BOOLEAN NOT NULL DEFAULT TRUE,
  batting_position INTEGER,
  UNIQUE(innings_id, player_id)
);

-- Bowling Performances Table
CREATE TABLE bowling_performances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  innings_id UUID NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  overs NUMERIC(4, 1) NOT NULL DEFAULT 0.0,
  maidens INTEGER NOT NULL DEFAULT 0,
  runs_conceded INTEGER NOT NULL DEFAULT 0,
  wickets INTEGER NOT NULL DEFAULT 0,
  wides INTEGER NOT NULL DEFAULT 0,
  no_balls INTEGER NOT NULL DEFAULT 0,
  UNIQUE(innings_id, player_id)
);

-- Partnerships Table
CREATE TABLE partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  innings_id UUID NOT NULL REFERENCES innings(id) ON DELETE CASCADE,
  batsman1_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  batsman2_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  runs INTEGER NOT NULL DEFAULT 0,
  balls INTEGER NOT NULL DEFAULT 0,
  wicket_number INTEGER NOT NULL,
  UNIQUE(innings_id, wicket_number)
);

-- Points Table (View)
CREATE OR REPLACE VIEW points_table AS
SELECT 
    t.tournament_id,
    t.id AS team_id,
    COUNT(m.id) AS matches_played,
    SUM(CASE WHEN m.result LIKE '%' || t.name || '%' AND m.result NOT LIKE '%Tie%' THEN 1 ELSE 0 END) AS won,
    SUM(CASE WHEN m.result IS NOT NULL AND m.result NOT LIKE '%' || t.name || '%' AND m.result NOT LIKE '%Tie%' THEN 1 ELSE 0 END) AS lost,
    SUM(CASE WHEN m.result LIKE '%Tie%' THEN 1 ELSE 0 END) AS tied,
    SUM(CASE WHEN m.status = 'abandoned' THEN 1 ELSE 0 END) AS no_result,
    (
        SUM(CASE WHEN m.result LIKE '%' || t.name || '%' AND m.result NOT LIKE '%Tie%' THEN 2 ELSE 0 END) +
        SUM(CASE WHEN m.result LIKE '%Tie%' THEN 1 ELSE 0 END) +
        SUM(CASE WHEN m.status = 'abandoned' THEN 1 ELSE 0 END)
    ) AS points,
    0.0 AS nrr -- NRR logic can be complex to calculate entirely in a simple view, usually better computed application-side or with a materialized view/triggers. We'll set 0.0 here and calculate it precisely in the frontend for now.
FROM 
    teams t
LEFT JOIN 
    matches m ON (t.id = m.team1_id OR t.id = m.team2_id) AND (m.status = 'completed' OR m.status = 'abandoned')
GROUP BY 
    t.tournament_id, t.id, t.name;

-- Announcements Table
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Row Level Security (RLS)
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE innings ENABLE ROW LEVEL SECURITY;
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE batting_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE bowling_performances ENABLE ROW LEVEL SECURITY;
ALTER TABLE partnerships ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- Public read access policies
CREATE POLICY "Public read access for tournaments" ON tournaments FOR SELECT USING (true);
CREATE POLICY "Public read access for teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Public read access for players" ON players FOR SELECT USING (true);
CREATE POLICY "Public read access for matches" ON matches FOR SELECT USING (true);
CREATE POLICY "Public read access for innings" ON innings FOR SELECT USING (true);
CREATE POLICY "Public read access for deliveries" ON deliveries FOR SELECT USING (true);
CREATE POLICY "Public read access for batting_performances" ON batting_performances FOR SELECT USING (true);
CREATE POLICY "Public read access for bowling_performances" ON bowling_performances FOR SELECT USING (true);
CREATE POLICY "Public read access for partnerships" ON partnerships FOR SELECT USING (true);
CREATE POLICY "Public read access for announcements" ON announcements FOR SELECT USING (true);

-- Admin write access policies (assuming authenticated users are admins)
CREATE POLICY "Admin write access for tournaments" ON tournaments FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for teams" ON teams FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for players" ON players FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for matches" ON matches FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for innings" ON innings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for deliveries" ON deliveries FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for batting_performances" ON batting_performances FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for bowling_performances" ON bowling_performances FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for partnerships" ON partnerships FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Admin write access for announcements" ON announcements FOR ALL USING (auth.role() = 'authenticated');

-- Enable realtime subscriptions for scoring updates
alter publication supabase_realtime add table matches;
alter publication supabase_realtime add table innings;
alter publication supabase_realtime add table deliveries;
