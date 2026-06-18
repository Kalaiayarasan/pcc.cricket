import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from('teams')
      .insert([
        {
          name: body.name,
          short_name: body.short_name,
          home_ground: body.home_ground || null,
          tournament_id: body.tournament_id,
        },
      ])
      .select('id, name')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, team: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create team' }, { status: 500 });
  }
}
