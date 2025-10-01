// Proxy API route to forward requests to backend
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://34.28.128.48';

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  // Path already includes 'api/', so don't add it again
  const url = `${BACKEND_URL}/${path}${searchParams ? `?${searchParams}` : ''}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!key.startsWith('x-') && key !== 'host' && key !== 'connection') {
      headers.set(key, value);
    }
  });
  
  // Add ngrok bypass header for free tier
  headers.set('ngrok-skip-browser-warning', 'true');

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/${path}`;
  const body = await request.text();

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!key.startsWith('x-') && key !== 'host' && key !== 'connection') {
      headers.set(key, value);
    }
  });
  
  // Add ngrok bypass header for free tier
  headers.set('ngrok-skip-browser-warning', 'true');

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/${path}`;
  const body = await request.text();

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!key.startsWith('x-') && key !== 'host' && key !== 'connection') {
      headers.set(key, value);
    }
  });
  
  // Add ngrok bypass header for free tier
  headers.set('ngrok-skip-browser-warning', 'true');

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers,
      body,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  const params = await context.params;
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/${path}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!key.startsWith('x-') && key !== 'host' && key !== 'connection') {
      headers.set(key, value);
    }
  });
  
  // Add ngrok bypass header for free tier
  headers.set('ngrok-skip-browser-warning', 'true');

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch from backend' },
      { status: 500 }
    );
  }
}

