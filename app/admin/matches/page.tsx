'use client';

import { useEffect, useState } from 'react';
import { getFallbackData, saveFallbackData } from '@/lib/fallback-data';

type Match = {
  id: string;
  venue: string | null;
  scheduled_at: string;
  status: string;
  total_overs: number;
  team1_name: string;
  team2_name: string;
};

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    team1_name: '',
    team2_name: '',
    venue: '',
    scheduled_at: '',
    status: 'upcoming',
    total_overs: '10',
  });

  const fetchData = async () => {
    const fallbackData = getFallbackData();
    setMatches(
      fallbackData.matches.map((match) => ({
        id: match.id,
        venue: match.venue ?? null,
        scheduled_at: match.scheduled_at,
        status: match.status,
        total_overs: match.total_overs ?? 10,
        team1_name:
          match.team1_name ||
          fallbackData.teams.find((team) => team.id === match.team1_id)?.name ||
          'TBA',
        team2_name:
          match.team2_name ||
          fallbackData.teams.find((team) => team.id === match.team2_id)?.name ||
          'TBA',
      }))
    );
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!form.team1_name || !form.team2_name || !form.scheduled_at) {
      setMessage('Please fill all required fields.');
      return;
    }

    const fallbackData = getFallbackData();

    if (form.team1_name.trim() === form.team2_name.trim()) {
      setMessage('Please enter two different team names.');
      return;
    }

    const newMatch = {
      id: `fallback-match-${Date.now()}`,
      tournament_id: fallbackData.tournaments[0]?.id || 'fallback-tournament-1',
      team1_name: form.team1_name.trim(),
      team2_name: form.team2_name.trim(),
      venue: form.venue || null,
      scheduled_at: form.scheduled_at,
      status: form.status,
      total_overs: Number(form.total_overs),
      created_at: new Date().toISOString(),
    };

    const updatedData = {
      ...fallbackData,
      matches: [newMatch, ...fallbackData.matches],
    };

    saveFallbackData(updatedData);
    setForm({
      team1_name: '',
      team2_name: '',
      venue: '',
      scheduled_at: '',
      status: 'upcoming',
      total_overs: '10',
    });
    await fetchData();
    setMessage('Match added successfully.');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Matches</h1>
        <p className="text-[#8fa899]">Schedule and manage match fixtures</p>
      </div>

      {message && (
        <div className="mb-6 rounded-md bg-[#1a6b3a]/10 border border-[#1a6b3a]/30 text-[#9fda9d] px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 card card-p">
          <h2 className="font-bold text-white mb-4">Add Match</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Team 1 Name</label>
              <input
                className="form-input bg-[#061409]/50"
                value={form.team1_name}
                onChange={(e) => setForm({ ...form, team1_name: e.target.value })}
                placeholder="Enter team 1 name"
              />
            </div>
            <div>
              <label className="form-label">Team 2 Name</label>
              <input
                className="form-input bg-[#061409]/50"
                value={form.team2_name}
                onChange={(e) => setForm({ ...form, team2_name: e.target.value })}
                placeholder="Enter team 2 name"
              />
            </div>
            <div>
              <label className="form-label">Venue</label>
              <input
                className="form-input bg-[#061409]/50"
                value={form.venue}
                onChange={(e) => setForm({ ...form, venue: e.target.value })}
                placeholder="Optional"
              />
            </div>
            <div>
              <label className="form-label">Date & Time</label>
              <input
                type="datetime-local"
                className="form-input bg-[#061409]/50"
                value={form.scheduled_at}
                onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })}
              />
            </div>
            <div>
              <label className="form-label">Status</label>
              <select
                className="form-input bg-[#061409]/50"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                <option value="upcoming">Upcoming</option>
                <option value="live">Live</option>
                <option value="completed">Completed</option>
                <option value="abandoned">Abandoned</option>
              </select>
            </div>
            <div>
              <label className="form-label">Overs</label>
              <input
                type="number"
                className="form-input bg-[#061409]/50"
                value={form.total_overs}
                onChange={(e) => setForm({ ...form, total_overs: e.target.value })}
              />
            </div>
            <button type="submit" className="btn btn-gold w-full">Add Match</button>
          </form>
        </div>

        <div className="xl:col-span-2 card card-p overflow-hidden">
          <h2 className="font-bold text-white mb-4">Fixture List</h2>
          {loading ? (
            <p className="text-[#8fa899]">Loading matches...</p>
          ) : matches.length === 0 ? (
            <p className="text-[#8fa899]">No matches added yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[#8fa899] border-b border-[#1a6b3a]/20">
                    <th className="text-left py-2">Fixture</th>
                    <th className="text-left py-2">Date</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((match) => (
                    <tr key={match.id} className="border-b border-[#1a6b3a]/10">
                      <td className="py-3 text-white font-medium">
                        {match.team1_name} vs {match.team2_name}
                      </td>
                      <td className="py-3 text-[#8fa899]">{new Date(match.scheduled_at).toLocaleString()}</td>
                      <td className="py-3 text-[#d4a017] capitalize">{match.status}</td>
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
