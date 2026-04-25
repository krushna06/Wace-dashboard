import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../[...nextauth]/route';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const API_AUTH_TOKEN = process.env.NEXT_PUBLIC_API_AUTH_TOKEN;

if (!API_BASE_URL || !API_AUTH_TOKEN) {
  throw new Error('Missing required environment variables');
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ authorized: false, isDJ: false, isPremium: false }, { status: 401 });
    }

    const { guildId } = await req.json();

    if (!guildId) {
      return NextResponse.json({ error: 'Missing guildId' }, { status: 400 });
    }

    let isDJ = true;
    if (process.env.NEXT_PUBLIC_DJ_ONLY === 'true') {
      try {
        const headers = new Headers();
        headers.set('Authorization', API_AUTH_TOKEN!);

        const djResponse = await fetch(`${API_BASE_URL}/v1/dj/${guildId}/userid?userid=${session.user.id}`, {
          headers,
        });
        const djData = await djResponse.json();
        isDJ = djData?.data === 1;
      } catch (error) {
        console.error('DJ check error:', error);
        isDJ = false;
      }
    }

    let isPremium = true;
    if (process.env.NEXT_PUBLIC_PREMIUM_ONLY === 'true') {
      try {
        const headers = new Headers();
        headers.set('Authorization', API_AUTH_TOKEN!);

        const premiumResponse = await fetch(`${API_BASE_URL}/v1/premium/user/${session.user.id}`, {
          headers,
        });
        const premiumData = await premiumResponse.json();
        isPremium = premiumData?.data?.premium === true;
      } catch (error) {
        console.error('Premium check error:', error);
        isPremium = false;
      }
    }

    return NextResponse.json({
      authorized: true,
      isDJ,
      isPremium,
      userId: session.user.id,
    });
  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
