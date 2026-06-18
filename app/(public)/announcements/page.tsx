import { createClient } from '@/lib/supabase/server';
import { Announcement } from '@/lib/types/database';

export const revalidate = 60;

export default async function AnnouncementsPage() {
  const supabase = await createClient();

  const { data: announcementsData } = await supabase
    .from('announcements')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });

  const announcements = (announcementsData || []) as Announcement[];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  return (
    <>
      <div className="page-header">
        <div className="container text-center">
          <h1 className="page-title">Announcements</h1>
          <p className="page-subtitle">Official news and updates from PCC</p>
        </div>
      </div>

      <section className="section pt-0">
        <div className="container max-w-3xl">
          {announcements.length > 0 ? (
            <div className="flex flex-col gap-4">
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id} 
                  className={`card card-p relative ${announcement.is_pinned ? 'border-[#d4a017]/50 shadow-[0_0_15px_rgba(212,160,23,0.1)]' : ''}`}
                >
                  {announcement.is_pinned && (
                    <div className="absolute top-0 right-0 bg-[#d4a017] text-[#061409] text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg flex items-center gap-1">
                      <span>📌</span> Pinned
                    </div>
                  )}
                  
                  <h3 className={`text-xl font-bold mb-2 pr-20 ${announcement.is_pinned ? 'text-[#d4a017]' : 'text-white'}`}>
                    {announcement.title}
                  </h3>
                  
                  <p className="text-[#8fa899] text-xs font-mono mb-4">
                    Posted on {formatDate(announcement.created_at)}
                  </p>
                  
                  <div className="text-white whitespace-pre-wrap leading-relaxed">
                    {announcement.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card card-p-lg text-center">
              <div className="text-4xl mb-4">📢</div>
              <h3 className="text-xl font-bold mb-2">No Announcements</h3>
              <p className="text-[#8fa899]">There are no official announcements at this time.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
