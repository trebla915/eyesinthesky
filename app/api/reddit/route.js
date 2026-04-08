import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sub = searchParams.get('sub') || 'ElPaso';
  const limit = parseInt(searchParams.get('limit') || '5', 10);

  const url = `https://www.reddit.com/r/${encodeURIComponent(sub)}/new.json?limit=${encodeURIComponent(String(limit))}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: { 'User-Agent': 'EyesInTheSky/1.0 (El Paso dashboard; contact: admin@eyesinthesky.app)' },
    });
    if (!response.ok) {
      return NextResponse.json({ error: `Upstream error: ${response.status}` }, { status: response.status });
    }
    const data = await response.json();
    const children = data?.data?.children || [];
    const items = children.map((child) => {
      const p = child?.data || {};
      return {
        id: p.id,
        title: p.title,
        url: `https://reddit.com${p.permalink}`,
        author: p.author,
        comments: p.num_comments,
        upvotes: p.ups,
        thumbnail: typeof p.thumbnail === 'string' && p.thumbnail.startsWith('http') ? p.thumbnail : '',
      };
    });
    return NextResponse.json(items, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reddit' }, { status: 502 });
  }
}


