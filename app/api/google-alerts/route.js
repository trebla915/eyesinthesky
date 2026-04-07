import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// Google News RSS — public, no auth needed
const RSS_URL =
  'https://news.google.com/rss/search?q=El+Paso+Texas&hl=en-US&gl=US&ceid=US:en';

export async function GET() {
  try {
    const response = await fetch(RSS_URL, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EyesInTheSky/1.0)' },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Google News returned ${response.status}`);
    }

    const xml = await response.text();
    const root = parse(xml);
    const items = root.querySelectorAll('item');

    const alerts = items.slice(0, 15).map((item, i) => {
      const title = item.querySelector('title')?.text?.trim() ?? '';
      const link = item.querySelector('link')?.text?.trim()
        ?? item.querySelector('guid')?.text?.trim()
        ?? '#';
      const pubDate = item.querySelector('pubDate')?.text?.trim() ?? '';
      const source = item.querySelector('source')?.text?.trim() ?? '';
      const description = item.querySelector('description')?.text
        ?.replace(/<[^>]+>/g, '')
        .trim()
        .slice(0, 200) ?? '';

      return {
        id: `gn-${i}-${Date.now()}`,
        title,
        description,
        url: link,
        publishedAt: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
        source: source || 'Google News',
        category: categorize(title),
        relevance: 'medium',
      };
    });

    return NextResponse.json(alerts, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Error fetching Google News:', error);
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

function categorize(title) {
  const t = title.toLowerCase();
  if (t.match(/police|crime|arrest|shooting|murder|homicide|robbery/)) return 'Public Safety';
  if (t.match(/fire|emergency|evacuation|flood|storm/)) return 'Emergency';
  if (t.match(/school|education|isd|university|utep/)) return 'Education';
  if (t.match(/health|hospital|medical|covid|disease/)) return 'Health';
  if (t.match(/city council|mayor|government|election|vote|border/)) return 'Government';
  if (t.match(/traffic|road|highway|construction|txdot/)) return 'Traffic';
  return 'General';
}
