import { NextRequest, NextResponse } from 'next/server';
import { getMockQuizEncounters } from '@/lib/mockQuizzes';

/**
 * ACRE Battle Arena API Route
 * Generates battle scenarios based on learning material
 * 
 * In test mode: Uses mock data
 * In production: Calls backend ACRE API
 * On API failure: Falls back to mock data
 */

function getMockBattleResponse(title: string) {
  const encounters = getMockQuizEncounters();
  const shuffledEncounters = [...encounters].sort(() => Math.random() - 0.5);

  return {
    battle_state: {
      boss: {
        boss_name: `Quiz: ${title || "Knowledge Test"}`,
        intro_narrative: `Answer questions to test your knowledge on this topic.`,
        encounters: shuffledEncounters,
      },
      current_encounter_index: 0,
      player_hp: 100,
      max_player_hp: 100,
      boss_hp: shuffledEncounters.length * 20,
      max_boss_hp: shuffledEncounters.length * 20,
      is_victory: false,
      is_defeat: false,
      battle_log: [],
    },
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const textMaterial = formData.get('text_material') as string;
    const url = formData.get('url') as string;
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    // Check if we're in test mode from query param or header
    const searchParams = new URL(request.url).searchParams;
    const testModeParam = searchParams.get('testMode');
    const testModeHeader = request.headers.get('X-Test-Mode');
    const isTestMode = testModeParam === 'true' || testModeHeader === 'true' || process.env.USE_MOCK_DATA === 'true';
    
    if (isTestMode) {
      console.log('[Battle API] Using mock data (test mode)');
      return NextResponse.json(getMockBattleResponse(title));
    }

    // Get auth token from header
    const authHeader = request.headers.get('Authorization');

    // Prepare payload for ACRE backend
    const backendPayload = new FormData();
    if (textMaterial) backendPayload.append('text_material', textMaterial);
    if (url) backendPayload.append('url', url);
    if (file) backendPayload.append('file', file);
    if (title) backendPayload.append('title', title);

    // Call ACRE backend at port 5000
    const backendUrl = process.env.ACRE_BACKEND_URL || 'http://localhost:5000';
    console.log(`[Battle API] Calling backend at ${backendUrl}`);
    
    const response = await fetch(`${backendUrl}/api/generate-battle-scenarios`, {
      method: 'POST',
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: backendPayload,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.warn(`[Battle API] Backend returned status ${response.status}, falling back to mock data`);
      
      // Fall back to mock data on API error
      return NextResponse.json(getMockBattleResponse(title));
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[Battle API] Error:', error);
    console.log('[Battle API] Falling back to mock data');
    
    // Extract title from FormData or use default
    let title = 'Knowledge Test';
    try {
      const formData = await request.formData();
      const titleValue = formData.get('title');
      if (titleValue) title = titleValue as string;
    } catch {}
    
    // Fall back to mock data on any error
    return NextResponse.json(getMockBattleResponse(title));
  }
}
