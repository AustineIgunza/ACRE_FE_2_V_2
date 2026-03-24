import { NextRequest, NextResponse } from 'next/server';

/**
 * ACRE Learning Session API Route
 * Generates learning scenarios from study material
 * 
 * Frontend calls this → This calls backend ACRE API
 */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const textMaterial = formData.get('text_material') as string;
    const url = formData.get('url') as string;
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;

    // Get auth token from header
    const authHeader = request.headers.get('Authorization');

    // Prepare payload for ACRE backend
    const backendPayload = new FormData();
    if (textMaterial) backendPayload.append('text_material', textMaterial);
    if (url) backendPayload.append('url', url);
    if (file) backendPayload.append('file', file);
    if (title) backendPayload.append('title', title);

    // Call ACRE backend at configured URL
    const backendUrl = process.env.ACRE_BACKEND_URL || 'http://localhost:3001';
    const response = await fetch(`${backendUrl}/api/generate-scenarios`, {
      method: 'POST',
      headers: {
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: backendPayload,
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Backend error:', errorData);
      return NextResponse.json(
        { error: 'Backend error', details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate scenarios', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
