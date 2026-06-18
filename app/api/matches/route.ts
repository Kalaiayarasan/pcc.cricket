import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServiceClient();

    let tournamentId = body.tournament_id;

    if (!tournamentId) {
      const { data: fallbackTournament } = await supabase
        .from('tournaments')
        .select('id')
        .limit(1)
        .single();
      tournamentId = fallbackTournament?.id;
    }

    if (!tournamentId) {
      return NextResponse.json({ error: 'No tournament available. Create one first.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('matches')
      .insert([
        {
          tournament_id: tournamentId,
          team1_id: body.team1_id,
          team2_id: body.team2_id,
          venue: body.venue || null,
          scheduled_at: body.scheduled_at,
          status: body.status || 'upcoming',
          total_overs: body.total_overs || 10,
        },
      ])
      .select('id')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, match: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create match' }, { status: 500 });
  }
}
