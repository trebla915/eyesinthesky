export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

import { parse } from 'node-html-parser';

const SOURCE_URL = 'https://www2.elpasotexas.gov/traffic/';

async function fetchIncidents() {
  const response = await fetch(SOURCE_URL, {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EyesInTheSky/1.0)' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);

  const html = await response.text();
  const root = parse(html);
  const rows = root.querySelectorAll('table tr');
  const incidents = [];

  for (let i = 2; i < rows.length; i++) {
    const cells = rows[i].querySelectorAll('td');
    if (cells.length < 4) continue;

    const timeRaw = cells[0].innerHTML
      .replace(/<br\s*\/?>/gi, ' ')
      .replace(/<[^>]+>/g, '')
      .trim();

    const problemCell = cells[1];
    const mapAnchor = problemCell.querySelector('a');
    const locationText = mapAnchor
      ? mapAnchor.text.replace(/\s+/g, ' ').trim()
      : problemCell.text.trim();
    const callType = problemCell.innerHTML
      .split('<br')[0]
      .replace(/<[^>]+>/g, '')
      .trim();

    const status = cells[3].text.trim();
    if (!timeRaw && !callType) continue;

    incidents.push({
      id: `ep-${i}`,
      callType: callType || 'UNKNOWN',
      locationText,
      datetimeStr: timeRaw,
      isActive: status !== 'CLEARED',
      response: cells[2].text.trim(),
      status,
    });
  }

  return incidents;
}

export async function GET(request) {
  const encoder = new TextEncoder();
  let isClosed = false;
  let timeoutId;

  const stream = new ReadableStream({
    start(controller) {
      function sendEvent(payload) {
        const data = JSON.stringify(payload);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      async function tick() {
        if (isClosed) return;
        try {
          const incidents = await fetchIncidents();
          sendEvent({ incidents, ts: Date.now() });
        } catch (error) {
          sendEvent({ error: 'Failed to fetch incidents', message: String(error), ts: Date.now() });
        } finally {
          timeoutId = setTimeout(tick, 30000);
        }
      }

      controller.enqueue(encoder.encode(': connected\n\n'));
      tick();

      request?.signal?.addEventListener('abort', () => {
        isClosed = true;
        if (timeoutId) clearTimeout(timeoutId);
        try { controller.close(); } catch (_) {}
      });
    },
    cancel() {
      isClosed = true;
      if (timeoutId) clearTimeout(timeoutId);
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
