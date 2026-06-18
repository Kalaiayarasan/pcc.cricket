'use client';

import { useEffect, useState } from 'react';
import { getFallbackData, saveFallbackData } from '@/lib/fallback-data';

type Team = {
  id: string;
  name: string;
  short_name: string;
  home_ground: string | null;
  tournament_id: string;
  created_at: string;
};

type Tournament = {
  id: string;
  name: string;
};

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    short_name: '',
    home_ground: '',
    tournament_id: '',
  });

  const fetchData = async () => {
    const fallbackData = getFallbackData();
    setTournaments(fallbackData.tournaments);
    setTeams(
      fallbackData.teams.map((team) => ({
        id: team.id,
        name: team.name,
        short_name: team.short_name,
        home_ground: team.home_ground ?? null,
        tournament_id: team.tournament_id,
        created_at: team.created_at,
      }))
    );

    if (fallbackData.tournaments.length > 0) {
      setForm((prev) => ({
        ...prev,
        tournament_id: prev.tournament_id || fallbackData.tournaments[0].id,
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

    if (!form.name || !form.short_name || !form.tournament_id) {
      setMessage('Please fill all required fields.');
      return;
    }

    const fallbackData = getFallbackData();

    if (!fallbackData.tournaments.some((t) => t.id === form.tournament_id)) {
      setMessage('Please select a valid tournament.');
      return;
    }

    const newTeam = {
      id: `fallback-team-${Date.now()}`,
      name: form.name,
      short_name: form.short_name,
      home_ground: form.home_ground || null,
      tournament_id: form.tournament_id,
      created_at: new Date().toISOString(),
    };

    const updatedData = {
      ...fallbackData,
      teams: [newTeam, ...fallbackData.teams],
    };

    saveFallbackData(updatedData);
    setForm({ name: '', short_name: '', home_ground: '', tournament_id: form.tournament_id });
    await fetchData();
    setMessage('Team added successfully.');
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white mb-2">Teams</h1>
          <p className="text-[#8fa899]">Manage club teams and their details</p>
        </div>
      </div>

      {message && (
        <div className="mb-6 rounded-md bg-[#1a6b3a]/10 border border-[#1a6b3a]/30 text-[#9fda9d] px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 card card-p">
          <h2 className="font-bold text-white mb-4">Add Team</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Tournament</label>
              <select
                className="form-input bg-[#061409]/50"
                value={form.tournament_id}
                onChange={(e) => setForm({ ...form, tournament_id: e.target.value })}
              >
                {tournaments.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="form-label">Team Name</label>
              <input
                className="form-input bg-[#061409]/50"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Panthers"
              />
            </div>
            <div>
              <label className="form-label">Short Name</label>
              <input
                className="form-input bg-[#061409]/50"
                value={form.short_name}
                onChange={(e) => setForm({ ...form, short_name: e.target.value })}
                placeholder="e.g. PNT"
              />
            </div>
            <div>
              <label className="form-label">Home Ground</label>
              <input
                className="form-input bg-[#061409]/50"
                value={form.home_ground}
                onChange={(e) => setForm({ ...form, home_ground: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <button type="submit" className="btn btn-gold w-full">Add Team</button>
          </form>
        </div>

        <div className="xl:col-span-2 card card-p overflow-hidden">
          <h2 className="font-bold text-white mb-4">Team List</h2>
          {loading ? (
            <p className="text-[#8fa899]">Loading teams...</p>
          ) : teams.length === 0 ? (
            <p className="text-[#8fa899]">No teams added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#8fa899] border-b border-[#1a6b3a]/20">
                    <th className="text-left py-2">Team</th>
                    <th className="text-left py-2">Short</th>
                    <th className="text-left py-2">Ground</th>
                  </tr>
                </thead>
                <tbody>
                  {teams.map((team) => (
                    <tr key={team.id} className="border-b border-[#1a6b3a]/10">
                      <td className="py-3 text-white font-medium">{team.name}</td>
                      <td className="py-3 text-[#d4a017]">{team.short_name}</td>
                      <td className="py-3 text-[#8fa899]">{team.home_ground || '—'}</td>
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
