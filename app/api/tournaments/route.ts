import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const supabase = await createServiceClient();

    const { data, error } = await supabase
      .from('tournaments')
      .insert([
        {
          name: body.name,
          season: body.season || '2026',
          start_date: body.start_date || new Date().toISOString().slice(0, 10),
          end_date: body.end_date || null,
          format: body.format || 'T10',
          status: body.status || 'upcoming',
          description: body.description || null,
        },
      ])
      .select('id, name')
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, tournament: data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create tournament' }, { status: 500 });
  }
}
