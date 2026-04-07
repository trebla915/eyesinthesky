import { NextResponse } from 'next/server';
import { buildWeatherUrl, mapWeatherResponse } from '../../../lib/weather';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'El Paso';
  const units = searchParams.get('units') || 'imperial';

  let url;
  try {
    url = buildWeatherUrl({ city, units });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }

  try {
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) {
      return NextResponse.json(
        { error: `Upstream error: ${response.status}` },
        { status: response.status }
      );
    }
    const data = await response.json();
    const mapped = mapWeatherResponse(data, city);
    return NextResponse.json(mapped, {
      headers: {
        'Cache-Control': 'no-store',
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch weather', message: String(error) }, { status: 502 });
  }
}


