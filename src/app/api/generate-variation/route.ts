import { NextRequest, NextResponse } from 'next/server';

/**
 * ACRE Generate Variation API Route
 * Generates parallel variations of crisis scenarios (for Frost state)
 * 
 * Frontend calls this → This calls backend ACRE API
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { originalContext, originalQuestion, variationType } = body;

    // Get auth token from header
    const authHeader = request.headers.get('Authorization');

    // Call ACRE backend
    const backendUrl = process.env.ACRE_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/generate-variation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: JSON.stringify({
        originalContext,
        originalQuestion,
        variationType,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend generate-variation error:', errorData);
      return NextResponse.json(
        { error: 'Backend variation generation failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate variation', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
