import { NextResponse } from 'next/server';
import { parse } from 'node-html-parser';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// ─── El Paso 911 (elpasotexas.gov scraper) ───────────────────────────────────

async function fetchElPaso911() {
  const response = await fetch('https://www2.elpasotexas.gov/traffic/', {
    headers: { 'User-Agent': 'Mozilla/5.0 (compatible; EyesInTheSky/1.0)' },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`El Paso 911 returned ${response.status}`);

  const root = parse(await response.text());
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
      id: `ep911-${i}-${Date.now()}`,
      callType: callType || 'UNKNOWN',
      locationText,
      datetimeStr: timeRaw,
      isActive: status !== 'CLEARED',
      response: cells[2].text.trim(),
      status,
      mapUrl: mapAnchor ? mapAnchor.getAttribute('href') : null,
      source: 'El Paso 911',
    });
  }

  return incidents;
}

// ─── PulsePoint ──────────────────────────────────────────────────────────────

const AGENCY_ID = process.env.PULSEPOINT_AGENCY_ID || 'GB803';

const TYPE_LABEL = {
  ME: 'Medical Emergency', MU: 'Mutual Aid', OA: 'Other Assistance',
  TC: 'Traffic Collision', ER: 'Emergency Response', CMA: 'Community Medical Assistance',
  VEG: 'Vegetation Fire', OI: 'Other Incident', AA: 'Auto Aid', ST: 'Strike Team',
  AE: 'Aircraft Emergency', AES: 'Aircraft Emergency Standby', AC: 'Aircraft Crash',
  LZ: 'Landing Zone', FULL: 'Full Assignment', AF: 'Appliance Fire', CHIM: 'Chimney Fire',
  CB: 'Controlled Burn', ELF: 'Electrical Fire', FIRE: 'Fire', GAS: 'Gas Main',
  HC: 'Hazardous Condition', MCI: 'Multi-Casualty Incident', FLW: 'Flood Warning',
  TOW: 'Tornado Warning', TSW: 'Tsunami Warning', EQ: 'Earthquake',
  RL: 'Residential Lockout', VL: 'Vehicle Lockout', CL: 'Commercial Lockout',
  SF: 'Structural Fire', OD: 'Overdose', HM: 'Hazardous Materials',
  MA: 'Medical Alert', ES: 'Emergency Services', AR: 'Animal Rescue',
  ELR: 'Elevator Rescue', USAR: 'Urban Search & Rescue', VS: 'Vessel Sinking',
  TCE: 'Expanded Traffic Collision', TCT: 'Train-Involved Collision',
  RTE: 'Railroad/Train Emergency', IF: 'Illegal Fire', MF: 'Marine Fire',
  OF: 'Outside Fire', PF: 'Pole Fire', GF: 'Garbage Fire',
};

function deriveKey(salt) {
  const seed = 'CommonIncidents';
  const password =
    seed[13] + seed[1] + seed[2] + 'brady' + '5' + 'r' +
    seed.toLowerCase()[6] + seed[5] + 'gs';

  let key = Buffer.alloc(0), block = null;
  while (key.length < 32) {
    const h = crypto.createHash('md5');
    if (block) h.update(block);
    h.update(Buffer.from(password, 'utf8'));
    h.update(salt);
    block = h.digest();
    key = Buffer.concat([key, block]);
  }
  return key.slice(0, 32);
}

function decryptPayload(src) {
  const ct   = Buffer.from(src.ct, 'base64');
  const iv   = Buffer.from(src.iv, 'hex');
  const salt = Buffer.from(src.s,  'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', deriveKey(salt), iv);
  const decrypted = Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
  const cleaned = decrypted.slice(1, decrypted.lastIndexOf('"')).replace(/\\"/g, '"');
  return JSON.parse(cleaned);
}

function toMT(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Denver',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: 'numeric', minute: '2-digit', hour12: true,
  });
}

async function fetchPulsePoint() {
  const url = `https://api.pulsepoint.org/v1/webapp?resource=incidents&agencyid=${AGENCY_ID}`;
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; EyesInTheSky/1.0)',
      Origin: 'https://web.pulsepoint.org',
    },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`PulsePoint returned ${response.status}`);

  const src = await response.json();
  const parsed = decryptPayload(src);
  const active = Array.isArray(parsed?.incidents?.active) ? parsed.incidents.active : [];
  const cutoff = Date.now() - 30 * 60 * 1000;

  return active
    .map((inc) => {
      const typeCode = String(inc.PulsePointIncidentCallType || '').trim();
      const units = Array.isArray(inc.Unit) ? inc.Unit : [];
      const clearedTimes = units.map((u) => u.UnitClearedDateTime).filter(Boolean).map((t) => new Date(t).getTime());
      const latestClear = clearedTimes.length ? Math.max(...clearedTimes) : null;
      const ts = inc.CallReceivedDateTime ? new Date(inc.CallReceivedDateTime).getTime() : 0;

      return {
        id: `pp-${inc.ID}`,
        callType: TYPE_LABEL[typeCode] || typeCode || 'Unknown',
        locationText: inc.FullDisplayAddress || inc.MedicalEmergencyDisplayAddress || 'Location not available',
        datetimeStr: toMT(inc.CallReceivedDateTime) || '',
        isActive: latestClear === null,
        status: latestClear === null ? 'ACTIVE' : 'CLEARED',
        mapUrl: inc.Latitude && inc.Longitude
          ? `https://www.google.com/maps?q=${inc.Latitude},${inc.Longitude}`
          : null,
        source: 'PulsePoint',
        _ts: ts,
      };
    })
    .filter((i) => i._ts >= cutoff || i._ts === 0)
    .map(({ _ts, ...i }) => i);
}

// ─── Merged route ─────────────────────────────────────────────────────────────

export async function GET() {
  const [ep911Result, ppResult] = await Promise.allSettled([
    fetchElPaso911(),
    fetchPulsePoint(),
  ]);

  const ep911 = ep911Result.status === 'fulfilled' ? ep911Result.value : [];
  const pp    = ppResult.status    === 'fulfilled' ? ppResult.value    : [];

  if (ep911Result.status === 'rejected') console.error('El Paso 911 failed:', ep911Result.reason);
  if (ppResult.status    === 'rejected') console.error('PulsePoint failed:',  ppResult.reason);

  // Merge and sort newest first; PulsePoint IDs are numeric strings, 911 are timestamped
  const merged = [...pp, ...ep911].sort((a, b) => {
    const ta = new Date(a.datetimeStr).getTime() || 0;
    const tb = new Date(b.datetimeStr).getTime() || 0;
    return tb - ta;
  });

  return NextResponse.json(merged, {
    headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
  });
}
