import { NextRequest, NextResponse } from 'next/server';

/**
 * ACRE Defense Evaluation API Route
 * Evaluates user's defense response to a crisis scenario
 * 
 * Frontend calls this → This calls backend ACRE API
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scenarioId, userChoice, userDefense, userId } = body;

    // Get auth token from header
    const authHeader = request.headers.get('Authorization');

    // Call ACRE backend
    const backendUrl = process.env.ACRE_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/evaluate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: JSON.stringify({
        scenarioId,
        userChoice,
        userDefense,
        userId,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend evaluate error:', errorData);
      return NextResponse.json(
        { error: 'Backend evaluation failed', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to evaluate defense', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
