import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from('players')
      .insert([
        {
          name: body.name,
          team_id: body.team_id,
          role: body.role || 'batsman',
          jersey_number: body.jersey_number ?? null,
          is_captain: false,
        },
      ])
      .select('id, name')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, player: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create player' }, { status: 500 });
  }
}
