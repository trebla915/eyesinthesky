import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const sub = searchParams.get('sub') || 'ElPaso';
  const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 25);

  const url = `https://www.reddit.com/r/${encodeURIComponent(sub)}/new.rss?limit=${limit}`;

  try {
    const response = await fetch(url, {
      cache: 'no-store',
      headers: {
        'User-Agent': 'EyesInTheSky/1.0 (El Paso city dashboard)',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Reddit returned ${response.status}` }, { status: response.status });
    }

    const xml = await response.text();
    const root = parse(xml);
    const entries = root.querySelectorAll('entry');

    const items = entries.slice(0, limit).map((entry) => {
      const title = decodeEntities(entry.querySelector('title')?.text?.trim() ?? '');
      const link = entry.querySelector('link')?.getAttribute('href')
        ?? entry.querySelector('id')?.text?.trim()
        ?? '#';
      const published = entry.querySelector('published')?.text?.trim() ?? '';
      const author = entry.querySelector('author name')?.text?.trim()
        ?? entry.querySelector('name')?.text?.trim()
        ?? '';

      // Extract comment count and upvotes from content if available
      const content = entry.querySelector('content')?.text ?? '';
      const commentsMatch = content.match(/(\d+)\s+comment/i);
      const upvotesMatch = content.match(/(\d+)\s+(point|upvote)/i);

      // Get thumbnail from media:thumbnail or content img
      const thumbnail = entry.querySelector('thumbnail')?.getAttribute('url')
        ?? entry.querySelector('img')?.getAttribute('src')
        ?? '';

      return {
        id: link.split('/comments/')[1]?.split('/')[0] ?? Math.random().toString(36).slice(2),
        title,
        url: link,
        author,
        comments: commentsMatch ? parseInt(commentsMatch[1]) : 0,
        upvotes: upvotesMatch ? parseInt(upvotesMatch[1]) : 0,
        publishedAt: published || new Date().toISOString(),
        thumbnail: thumbnail.startsWith('http') ? thumbnail : '',
      };
    });

    return NextResponse.json(items, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch Reddit' }, { status: 502 });
  }
}

function decodeEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, c) => String.fromCharCode(Number(c)))
    .trim();
}
