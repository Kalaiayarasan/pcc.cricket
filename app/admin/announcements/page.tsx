'use client';

import { useEffect, useState } from 'react';
import { getFallbackData, saveFallbackData } from '@/lib/fallback-data';

type Announcement = {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  created_at: string;
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '',
    content: '',
    is_pinned: false,
  });

  const fetchData = async () => {
    const fallbackData = getFallbackData();
    setAnnouncements(fallbackData.announcements);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!form.title || !form.content) {
      setMessage('Title and content are required.');
      return;
    }

    const fallbackData = getFallbackData();
    const newAnnouncement = {
      id: `fallback-announcement-${Date.now()}`,
      title: form.title,
      content: form.content,
      is_pinned: form.is_pinned,
      created_at: new Date().toISOString(),
    };

    const updatedData = {
      ...fallbackData,
      announcements: [newAnnouncement, ...fallbackData.announcements],
    };

    saveFallbackData(updatedData);
    setForm({ title: '', content: '', is_pinned: false });
    await fetchData();
    setMessage('Announcement posted successfully.');
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-black text-white mb-2">Announcements</h1>
        <p className="text-[#8fa899]">Post updates and notices</p>
      </div>

      {message && (
        <div className="mb-6 rounded-md bg-[#1a6b3a]/10 border border-[#1a6b3a]/30 text-[#9fda9d] px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-1 card card-p">
          <h2 className="font-bold text-white mb-4">New Announcement</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="form-label">Title</label>
              <input
                className="form-input bg-[#061409]/50"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Announcement title"
              />
            </div>
            <div>
              <label className="form-label">Content</label>
              <textarea
                className="form-input bg-[#061409]/50 min-h-[140px]"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Write your announcement here"
              />
            </div>
            <label className="flex items-center gap-2 text-sm text-[#8fa899]">
              <input
                type="checkbox"
                checked={form.is_pinned}
                onChange={(e) => setForm({ ...form, is_pinned: e.target.checked })}
              />
              Pin this announcement
            </label>
            <button type="submit" className="btn btn-gold w-full">Post Announcement</button>
          </form>
        </div>

        <div className="xl:col-span-2 card card-p overflow-hidden">
          <h2 className="font-bold text-white mb-4">Recent Announcements</h2>
          {loading ? (
            <p className="text-[#8fa899]">Loading announcements...</p>
          ) : announcements.length === 0 ? (
            <p className="text-[#8fa899]">No announcements yet.</p>
          ) : (
            <div className="space-y-4">
              {announcements.map((item) => (
                <div key={item.id} className="border border-[#1a6b3a]/20 rounded-lg p-4 bg-[#0d1f13]">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <h3 className="font-bold text-white">{item.title}</h3>
                    {item.is_pinned && (
                      <span className="text-xs uppercase text-[#d4a017]">Pinned</span>
                    )}
                  </div>
                  <p className="text-sm text-[#8fa899] whitespace-pre-wrap">{item.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
