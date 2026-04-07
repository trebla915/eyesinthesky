import { NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const AGENCY_ID = process.env.PULSEPOINT_AGENCY_ID || 'GB803';
const PP_URL = `https://api.pulsepoint.org/v1/webapp?resource=incidents&agencyid=${AGENCY_ID}`;

const TYPE_LABEL = {
  ME: 'Medical Emergency',
  MU: 'Mutual Aid',
  OA: 'Other Assistance',
  TC: 'Traffic Collision',
  ER: 'Emergency Response',
  CMA: 'Community Medical Assistance',
  VEG: 'Vegetation Fire',
  OI: 'Other Incident',
  AA: 'Auto Aid',
  ST: 'Strike Team',
  AE: 'Aircraft Emergency',
  AES: 'Aircraft Emergency Standby',
  AC: 'Aircraft Crash',
  LZ: 'Landing Zone',
  FULL: 'Full Assignment',
  AF: 'Appliance Fire',
  CHIM: 'Chimney Fire',
  CB: 'Controlled Burn',
  ELF: 'Electrical Fire',
  FIRE: 'Fire',
  GAS: 'Gas Main',
  HC: 'Hazardous Condition',
  MCI: 'Multi-Casualty Incident',
  FLW: 'Flood Warning',
  TOW: 'Tornado Warning',
  TSW: 'Tsunami Warning',
  EQ: 'Earthquake',
  RL: 'Residential Lockout',
  VL: 'Vehicle Lockout',
  CL: 'Commercial Lockout',
  SF: 'Structural Fire',
  OD: 'Overdose',
  HM: 'Hazardous Materials',
  MA: 'Medical Alert',
  ES: 'Emergency Services',
  AR: 'Animal Rescue',
  ELR: 'Elevator Rescue',
  USAR: 'Urban Search & Rescue',
  VS: 'Vessel Sinking',
  TCE: 'Expanded Traffic Collision',
  TCT: 'Train-Involved Collision',
  RTE: 'Railroad/Train Emergency',
  IF: 'Illegal Fire',
  MF: 'Marine Fire',
  OF: 'Outside Fire',
  PF: 'Pole Fire',
  GF: 'Garbage Fire',
};

const STATUS_LABEL = {
  ER: 'En Route',
  OS: 'On Scene',
  AR: 'At Hospital / Released',
  TR: 'Transporting',
  TA: 'Taking Assignment',
  DP: 'Dispatched',
  CA: 'Canceled',
  CL: 'Cleared',
};

function deriveKey(salt) {
  // OpenSSL EVP_BytesToKey with MD5, same derivation as the original n8n workflow
  const seed = 'CommonIncidents';
  const password =
    seed[13] + seed[1] + seed[2] + 'brady' + '5' + 'r' +
    seed.toLowerCase()[6] + seed[5] + 'gs';

  let key = Buffer.alloc(0);
  let block = null;
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

  const key = deriveKey(salt);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  const decrypted = Buffer.concat([decipher.update(ct), decipher.final()]).toString('utf8');
  const cleaned = decrypted.slice(1, decrypted.lastIndexOf('"')).replace(/\\"/g, '"');
  return JSON.parse(cleaned);
}

function toMT(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleString('en-US', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

export async function GET() {
  try {
    const response = await fetch(PP_URL, {
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

    const incidents = active
      .map((inc) => {
        const typeCode = String(inc.PulsePointIncidentCallType || '').trim();
        const units = Array.isArray(inc.Unit) ? inc.Unit : [];

        const clearedTimes = units
          .map((u) => u.UnitClearedDateTime)
          .filter(Boolean)
          .map((t) => new Date(t).getTime());
        const latestClear = clearedTimes.length ? Math.max(...clearedTimes) : null;

        const calledInMT = toMT(inc.CallReceivedDateTime);

        return {
          id: `pp-${inc.ID}`,
          callType: TYPE_LABEL[typeCode] || typeCode || 'Unknown',
          locationText: inc.FullDisplayAddress || inc.MedicalEmergencyDisplayAddress || 'Location not available',
          datetimeStr: calledInMT || '',
          isActive: latestClear === null,
          status: latestClear === null ? 'ACTIVE' : 'CLEARED',
          mapUrl: inc.Latitude && inc.Longitude
            ? `https://www.google.com/maps?q=${inc.Latitude},${inc.Longitude}`
            : null,
          source: 'PulsePoint',
          units: units.map((u) => ({
            id: u.UnitID,
            status: STATUS_LABEL[u.PulsePointDispatchStatus] || u.PulsePointDispatchStatus || null,
          })),
          _sortTs: inc.CallReceivedDateTime ? new Date(inc.CallReceivedDateTime).getTime() : 0,
        };
      })
      .filter((i) => i._sortTs >= cutoff || i._sortTs === 0)
      .sort((a, b) => b._sortTs - a._sortTs)
      .map(({ _sortTs, ...i }) => i);

    return NextResponse.json(incidents, {
      headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
    });
  } catch (error) {
    console.error('Error fetching PulsePoint:', error);
    return NextResponse.json([], {
      headers: { 'Cache-Control': 'no-store' },
    });
  }
}
