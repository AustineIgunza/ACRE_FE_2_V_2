import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

/**
 * ACRE Nodes API Route
 * Sync learning nodes to Supabase
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

export async function GET(request: NextRequest) {
  try {
    // Get auth token
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract token
    const token = authHeader.replace('Bearer ', '');

    // Verify token with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's nodes from Supabase
    const { data: nodes, error: fetchError } = await supabase
      .from('nodes')
      .select('*')
      .eq('user_id', user.id);

    if (fetchError) {
      return NextResponse.json({ error: 'Failed to fetch nodes' }, { status: 500 });
    }

    return NextResponse.json({ nodes });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch nodes', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, topic, status, heat, integrity, unitId } = body;

    // Create new node in Supabase
    const { data: newNode, error: insertError } = await supabase
      .from('nodes')
      .insert({
        user_id: user.id,
        title,
        topic,
        status: status || 'grey',
        heat: heat || 0,
        integrity: integrity || 0,
        unit_id: unitId,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to create node' }, { status: 500 });
    }

    return NextResponse.json({ node: newNode });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create node', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
