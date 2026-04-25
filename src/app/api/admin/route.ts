import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/config';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_AUTH_TOKEN = process.env.NEXT_PUBLIC_API_AUTH_TOKEN;

if (!API_BASE_URL || !API_AUTH_TOKEN) {
  throw new Error('Missing required environment variables');
}

async function getSession(req: NextRequest) {
  const session = await getServerSession(authOptions);
  return session;
}

export async function GET(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    const headers = new Headers();
    headers.set('Authorization', API_AUTH_TOKEN!);
    headers.set('x-user-id', session.user.id);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint');
    const body = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    const headers = new Headers();
    headers.set('Authorization', API_AUTH_TOKEN!);
    headers.set('x-user-id', session.user.id);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint');
    const body = await req.json();

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    const headers = new Headers();
    headers.set('Authorization', API_AUTH_TOKEN!);
    headers.set('x-user-id', session.user.id);
    headers.set('Content-Type', 'application/json');

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession(req);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const endpoint = searchParams.get('endpoint');

    if (!endpoint) {
      return NextResponse.json({ error: 'Missing endpoint' }, { status: 400 });
    }

    const headers = new Headers();
    headers.set('Authorization', API_AUTH_TOKEN!);
    headers.set('x-user-id', session.user.id);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
