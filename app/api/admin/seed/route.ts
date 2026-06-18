import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServiceClient();

    const { data: existingTournaments } = await supabase.from('tournaments').select('id').limit(1);
    const { data: existingTeams } = await supabase.from('teams').select('id').limit(1);

    if (!existingTournaments || existingTournaments.length === 0) {
      const { error: tournamentError } = await supabase.from('tournaments').insert([
        {
          name: 'PCC Season 2026',
          season: '2026',
          start_date: new Date().toISOString().slice(0, 10),
          format: 'T10',
          status: 'upcoming',
        },
      ]);

      if (tournamentError) {
        return NextResponse.json({ error: tournamentError.message }, { status: 400 });
      }
    }

    if (!existingTeams || existingTeams.length === 0) {
      const { data: tournament } = await supabase
        .from('tournaments')
        .select('id')
        .limit(1)
        .single();

      if (tournament) {
        const { error: teamError } = await supabase.from('teams').insert([
          {
            name: 'Sample Team A',
            short_name: 'STA',
            tournament_id: tournament.id,
          },
          {
            name: 'Sample Team B',
            short_name: 'STB',
            tournament_id: tournament.id,
          },
        ]);

        if (teamError) {
          return NextResponse.json({ error: teamError.message }, { status: 400 });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Seed failed' }, { status: 500 });
  }
}
