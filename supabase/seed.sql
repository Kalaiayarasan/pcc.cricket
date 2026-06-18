-- Seed data for PCC Cricket Tournament

-- 1. Create Tournament
INSERT INTO tournaments (id, name, season, start_date, end_date, format, status, description)
VALUES (
    't1000000-0000-0000-0000-000000000001',
    'PCC Summer Cup',
    '2026',
    '2026-05-01',
    '2026-05-31',
    'T10',
    'ongoing',
    'Annual cricket tournament organized by Pungampatti Cricket Club.'
);

-- 2. Create Teams
INSERT INTO teams (id, tournament_id, name, short_name, home_ground) VALUES
('te000000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001', 'PCC Warriors', 'WAR', 'Pungampatti Ground'),
('te000000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000001', 'PCC Challengers', 'CHA', 'Pungampatti Ground'),
('te000000-0000-0000-0000-000000000003', 't1000000-0000-0000-0000-000000000001', 'PCC Lions', 'LIO', 'Pungampatti Ground'),
('te000000-0000-0000-0000-000000000004', 't1000000-0000-0000-0000-000000000001', 'PCC Eagles', 'EAG', 'Pungampatti Ground');

-- 3. Create Players (Just a few for the demo)
-- Warriors
INSERT INTO players (id, team_id, name, role, is_captain, jersey_number) VALUES
('p0000000-0000-0000-0000-000000000001', 'te000000-0000-0000-0000-000000000001', 'Kalaiyarasan', 'all-rounder', TRUE, 7),
('p0000000-0000-0000-0000-000000000002', 'te000000-0000-0000-0000-000000000001', 'Muthu', 'batsman', FALSE, 10),
('p0000000-0000-0000-0000-000000000003', 'te000000-0000-0000-0000-000000000001', 'Siva', 'bowler', FALSE, 99);

-- Challengers
INSERT INTO players (id, team_id, name, role, is_captain, jersey_number) VALUES
('p0000000-0000-0000-0000-000000000011', 'te000000-0000-0000-0000-000000000002', 'Karthik', 'batsman', TRUE, 18),
('p0000000-0000-0000-0000-000000000012', 'te000000-0000-0000-0000-000000000002', 'Vijay', 'all-rounder', FALSE, 45),
('p0000000-0000-0000-0000-000000000013', 'te000000-0000-0000-0000-000000000002', 'Ajith', 'bowler', FALSE, 1);

-- Lions
INSERT INTO players (id, team_id, name, role, is_captain, jersey_number) VALUES
('p0000000-0000-0000-0000-000000000021', 'te000000-0000-0000-0000-000000000003', 'Surya', 'batsman', TRUE, 33),
('p0000000-0000-0000-0000-000000000022', 'te000000-0000-0000-0000-000000000003', 'Vikram', 'all-rounder', FALSE, 22);

-- Eagles
INSERT INTO players (id, team_id, name, role, is_captain, jersey_number) VALUES
('p0000000-0000-0000-0000-000000000031', 'te000000-0000-0000-0000-000000000004', 'Dhanush', 'batsman', TRUE, 11),
('p0000000-0000-0000-0000-000000000032', 'te000000-0000-0000-0000-000000000004', 'Simbu', 'bowler', FALSE, 8);

-- Update captains in teams table
UPDATE teams SET captain_id = 'p0000000-0000-0000-0000-000000000001' WHERE id = 'te000000-0000-0000-0000-000000000001';
UPDATE teams SET captain_id = 'p0000000-0000-0000-0000-000000000011' WHERE id = 'te000000-0000-0000-0000-000000000002';
UPDATE teams SET captain_id = 'p0000000-0000-0000-0000-000000000021' WHERE id = 'te000000-0000-0000-0000-000000000003';
UPDATE teams SET captain_id = 'p0000000-0000-0000-0000-000000000031' WHERE id = 'te000000-0000-0000-0000-000000000004';

-- 4. Create Matches
INSERT INTO matches (id, tournament_id, team1_id, team2_id, venue, scheduled_at, status, total_overs) VALUES
('m0000000-0000-0000-0000-000000000001', 't1000000-0000-0000-0000-000000000001', 'te000000-0000-0000-0000-000000000001', 'te000000-0000-0000-0000-000000000002', 'Pungampatti Ground', '2026-05-10 10:00:00+05:30', 'completed', 10),
('m0000000-0000-0000-0000-000000000002', 't1000000-0000-0000-0000-000000000001', 'te000000-0000-0000-0000-000000000003', 'te000000-0000-0000-0000-000000000004', 'Pungampatti Ground', '2026-05-11 10:00:00+05:30', 'live', 10),
('m0000000-0000-0000-0000-000000000003', 't1000000-0000-0000-0000-000000000001', 'te000000-0000-0000-0000-000000000001', 'te000000-0000-0000-0000-000000000003', 'Pungampatti Ground', '2026-05-15 10:00:00+05:30', 'upcoming', 10);

-- Update Match 1 to completed state
UPDATE matches 
SET result = 'PCC Warriors won by 15 runs', 
    toss_winner_id = 'te000000-0000-0000-0000-000000000001', 
    toss_decision = 'bat',
    batting_team_id = 'te000000-0000-0000-0000-000000000001',
    bowling_team_id = 'te000000-0000-0000-0000-000000000002',
    man_of_match_id = 'p0000000-0000-0000-0000-000000000001'
WHERE id = 'm0000000-0000-0000-0000-000000000001';

-- Update Match 2 to live state
UPDATE matches
SET toss_winner_id = 'te000000-0000-0000-0000-000000000003',
    toss_decision = 'bowl',
    batting_team_id = 'te000000-0000-0000-0000-000000000004',
    bowling_team_id = 'te000000-0000-0000-0000-000000000003'
WHERE id = 'm0000000-0000-0000-0000-000000000002';

-- 5. Create Announcements
INSERT INTO announcements (title, content, is_pinned) VALUES
('PCC Summer Cup 2026 Starts Soon!', 'Welcome to the annual PCC Summer Cup. Get ready for exciting T10 cricket action starting this May.', TRUE),
('Team Registrations Closed', 'Thank you to all the teams who registered. The fixtures will be announced shortly.', FALSE);
