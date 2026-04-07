import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NO_CACHE = { 'Cache-Control': 'no-store, no-cache, must-revalidate' };

export async function GET() {
  const [fda, usda] = await Promise.allSettled([fetchFDA(), fetchUSDA()]);

  const results = [
    ...(fda.status === 'fulfilled' ? fda.value : []),
    ...(usda.status === 'fulfilled' ? usda.value : []),
  ].sort((a, b) => new Date(b.date_iso) - new Date(a.date_iso));

  return NextResponse.json(results, { headers: NO_CACHE });
}

async function fetchFDA() {
  const url =
    'https://api.fda.gov/food/enforcement.json' +
    '?search=distribution_pattern:"Texas"&sort=report_date:desc&limit=10';

  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`FDA ${res.status}`);
  const data = await res.json();

  return (data.results ?? []).map((r) => ({
    id: r.recall_number || r.event_id || Math.random().toString(36).slice(2),
    source: 'FDA',
    product: r.product_description || r.brand_name || 'Unknown product',
    classification: r.classification || '',
    date: r.report_date
      ? new Date(r.report_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '',
    date_iso: r.report_date ? new Date(r.report_date).toISOString() : '',
    distribution: r.distribution_pattern || '',
    reason: r.reason_for_recall || '',
    alert_level: r.status || '',
    isNew: isRecent(r.report_date, 7),
  }));
}

async function fetchUSDA() {
  const url =
    'https://www.fsis.usda.gov/fsis/api/recall/v/1' +
    '?field_states_value=TX&field_closed_value=open&items_per_page=10';

  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw new Error(`USDA ${res.status}`);
  const data = await res.json();

  const items = Array.isArray(data) ? data : data?.data ?? [];
  return items.map((r) => ({
    id: String(r.nid || r.field_recall_number || Math.random().toString(36).slice(2)),
    source: 'USDA',
    product: r.title || 'Unknown product',
    classification: r.field_recall_classification || '',
    date: r.field_recall_date
      ? new Date(r.field_recall_date * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      : '',
    date_iso: r.field_recall_date ? new Date(r.field_recall_date * 1000).toISOString() : '',
    distribution: r.field_states_value || 'TX',
    reason: r.field_recall_reason || '',
    alert_level: r.field_closed_value || 'open',
    isNew: isRecent(r.field_recall_date ? r.field_recall_date * 1000 : null, 7),
  }));
}

function isRecent(dateValue, days) {
  if (!dateValue) return false;
  const d = new Date(dateValue);
  return (Date.now() - d.getTime()) < days * 24 * 60 * 60 * 1000;
}
