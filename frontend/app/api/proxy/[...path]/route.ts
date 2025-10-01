// Proxy API route to forward requests to backend
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://34.28.128.48';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const searchParams = request.nextUrl.searchParams.toString();
  const url = `${BACKEND_URL}/api/${path}${searchParams ? `?${searchParams}` : ''}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!key.startsWith('x-') && key !== 'host' && key !== 'connection') {
      headers.set(key, value);
    }
  });

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
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/api/${path}`;
  const body = await request.text();

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!key.startsWith('x-') && key !== 'host' && key !== 'connection') {
      headers.set(key, value);
    }
  });

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
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/api/${path}`;
  const body = await request.text();

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!key.startsWith('x-') && key !== 'host' && key !== 'connection') {
      headers.set(key, value);
    }
  });

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
  { params }: { params: { path: string[] } }
) {
  const path = params.path.join('/');
  const url = `${BACKEND_URL}/api/${path}`;

  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (!key.startsWith('x-') && key !== 'host' && key !== 'connection') {
      headers.set(key, value);
    }
  });

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

