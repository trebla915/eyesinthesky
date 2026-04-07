export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
import { fetchWeatherOnce } from '../../../../lib/weather';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const city = searchParams.get('city') || 'El Paso';
  const units = searchParams.get('units') || 'imperial';
  const intervalParam = parseInt(searchParams.get('interval') || '60', 10);
  const intervalSec = Number.isFinite(intervalParam) ? Math.min(Math.max(intervalParam, 15), 600) : 60;

  const encoder = new TextEncoder();
  let isClosed = false;
  let timeoutId;

  const stream = new ReadableStream({
    start(controller) {
      function sendEvent(payload) {
        const data = typeof payload === 'string' ? payload : JSON.stringify(payload);
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      function sendComment(text) {
        controller.enqueue(encoder.encode(`: ${text}\n\n`));
      }

      async function tick() {
        if (isClosed) return;
        try {
          const weather = await fetchWeatherOnce({ city, units });
          sendEvent({ weather, ts: Date.now() });
        } catch (error) {
          sendEvent({ error: 'Failed to fetch weather', message: String(error), ts: Date.now() });
        } finally {
          timeoutId = setTimeout(tick, intervalSec * 1000);
        }
      }

      sendComment('connected');
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
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}


