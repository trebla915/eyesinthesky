import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// El Paso bounding box
const BBOX = { top: 31.97, bottom: 31.58, left: -106.78, right: -106.18 };

const WAZE_URL =
  `https://www.waze.com/live-map/api/georss?` +
  `top=${BBOX.top}&bottom=${BBOX.bottom}&left=${BBOX.left}&right=${BBOX.right}` +
  `&env=row&types=alerts,traffic`;

export async function GET() {
  try {
    const response = await fetch(WAZE_URL, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; EyesInTheSky/1.0)',
        'Referer': 'https://www.waze.com/live-map',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`Waze returned ${response.status}`);
    }

    const data = await response.json();
    const alerts = normalizeAlerts(data?.alerts ?? []);

    return NextResponse.json(alerts, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Error fetching Waze alerts:', error);
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}

function normalizeAlerts(alerts) {
  return alerts.map((a) => ({
    id: a.uuid || a.id || Math.random().toString(36).slice(2),
    type: a.type || 'UNKNOWN',
    subtype: a.subtype || '',
    location: a.street || a.location || 'Location not available',
    description: a.reportDescription || a.description || '',
    timestamp: a.pubMillis ? new Date(a.pubMillis).toISOString() : new Date().toISOString(),
    severity: getSeverity(a),
    reportBy: 'Waze User',
    reliability: a.reliability ? a.reliability / 10 : 0,
    coordinates: a.location ? { lat: a.location.y, lng: a.location.x } : null,
    city: a.city || 'El Paso',
    street: a.street || '',
    uuid: a.uuid || '',
  }));
}

function getSeverity(alert) {
  const type = (alert.type || '').toUpperCase();
  if (type.includes('ACCIDENT') || type.includes('HAZARD') || type.includes('POLICE')) return 'high';
  if (type.includes('JAM') || type.includes('TRAFFIC')) return 'medium';
  return 'low';
}
