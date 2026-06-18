'use client';

import { useEffect, useState } from 'react';
import { getFallbackData, saveFallbackData } from '@/lib/fallback-data';

type Player = {
  id: string;
  name: string;
  jersey_number: number | null;
  role: string;
  team_id: string;
  is_captain: boolean;
  created_at: string;
};

type Team = {
  id: string;
  name: string;
  short_name: string;
};

export default function AdminPlayersPage() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    team_id: '',
    role: 'batsman',
    jersey_number: '',
  });

  const fetchData = async () => {
    const fallbackData = getFallbackData();
    setTeams(fallbackData.teams);
    setPlayers(
      fallbackData.players.map((player) => ({
        id: player.id,
        name: player.name,
        jersey_number: player.jersey_number ?? null,
        role: player.role,
        team_id: player.team_id,
        is_captain: player.is_captain ?? false,
        created_at: player.created_at,
      }))
    );

    if (fallbackData.teams.length > 0) {
      setForm((prev) => ({
        ...prev,
        team_id: prev.team_id || fallbackData.teams[0].id,
      }));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!form.name || !form.team_id) {
      setMessage('Please fill required fields.');
      return;
    }

    const fallbackData = getFallbackData();

    if (!fallbackData.teams.some((team) => team.id === form.team_id)) {
      setMessage('Please select a valid team.');
      return;
    }

    const newPlayer = {
      id: `fallback-player-${Date.now()}`,
      name: form.name,
      team_id: form.team_id,
      role: form.role,
      jersey_number: form.jersey_number ? Number(form.jersey_number) : null,
      is_captain: false,
      created_at: new Date().toISOString(),
    };

    const updatedData = {
      ...fallbackData,
      players: [newPlayer, ...fallbackData.players],
    };

    saveFallbackData(updatedData);
    setForm({ name: '', team_id: form.team_id, role: 'batsman', jersey_number: '' });
    await fetchData();
    setMessage('Player added successfully.');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Players</h1>
        <p className="text-[#8fa899]">Manage player roster and roles</p>
      </div>

      {message && (
        <div className="mb-6 rounded-md bg-[#1a6b3a]/10 border border-[#1a6b3a]/30 text-[#9fda9d] px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 card card-p">
          <h2 className="font-bold text-white mb-4">Add Player</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Team</label>
              <select
                className="form-input bg-[#061409]/50"
                value={form.team_id}
                onChange={(e) => setForm({ ...form, team_id: e.target.value })}
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Player Name</label>
              <input
                className="form-input bg-[#061409]/50"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Ravi Kumar"
              />
            </div>
            <div>
              <label className="form-label">Role</label>
              <select
                className="form-input bg-[#061409]/50"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="all-rounder">All-rounder</option>
                <option value="wicket-keeper">Wicket Keeper</option>
              </select>
            </div>
            <div>
              <label className="form-label">Jersey Number</label>
              <input
                type="number"
                className="form-input bg-[#061409]/50"
                value={form.jersey_number}
                onChange={(e) => setForm({ ...form, jersey_number: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <button type="submit" className="btn btn-gold w-full">Add Player</button>
          </form>
        </div>

        <div className="xl:col-span-2 card card-p overflow-hidden">
          <h2 className="font-bold text-white mb-4">Player List</h2>
          {loading ? (
            <p className="text-[#8fa899]">Loading players...</p>
          ) : players.length === 0 ? (
            <p className="text-[#8fa899]">No players added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#8fa899] border-b border-[#1a6b3a]/20">
                    <th className="text-left py-2">Player</th>
                    <th className="text-left py-2">Team</th>
                    <th className="text-left py-2">Role</th>
                    <th className="text-left py-2">Jersey</th>
                  </tr>
                </thead>
                <tbody>
                  {players.map((player) => (
                    <tr key={player.id} className="border-b border-[#1a6b3a]/10">
                      <td className="py-3 text-white font-medium">{player.name}</td>
                      <td className="py-3 text-[#8fa899]">{teams.find((t) => t.id === player.team_id)?.name || '—'}</td>
                      <td className="py-3 text-[#d4a017] capitalize">{player.role.replace('-', ' ')}</td>
                      <td className="py-3 text-[#8fa899]">{player.jersey_number ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
