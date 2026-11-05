import type { SolarEvent } from '@amt/shared';

const day = (d: Date) => d.toISOString().slice(0, 10);

interface DonkiFlare {
  flrID: string;
  classType?: string;
  beginTime: string;
  peakTime?: string;
  link?: string;
}
interface DonkiCme {
  activityID: string;
  startTime: string;
  link?: string;
}

async function get<T>(path: string, params: Record<string, string>, timeoutMs: number): Promise<T[]> {
  const url = `https://api.nasa.gov/DONKI/${path}?${new URLSearchParams(params)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`DONKI ${path} HTTP ${res.status}`);
  const body = (await res.json()) as T[] | null;
  return body ?? [];
}

export const mapFlare = (f: DonkiFlare): SolarEvent => ({
  id: f.flrID,
  kind: 'flare',
  classType: f.classType,
  startTime: f.beginTime,
  peakTime: f.peakTime,
  sourceUrl: f.link,
});
export const mapCme = (c: DonkiCme): SolarEvent => ({
  id: c.activityID,
  kind: 'cme',
  startTime: c.startTime,
  sourceUrl: c.link,
});

/** Flares and CMEs from the last `days` days. Throws on any failure: the caller falls back. */
export async function fetchSolarEvents(apiKey: string, now: Date, days = 3, timeoutMs = 8000): Promise<SolarEvent[]> {
  const params = { startDate: day(new Date(now.getTime() - days * 86_400_000)), endDate: day(now), api_key: apiKey };
  const [flares, cmes] = await Promise.all([get<DonkiFlare>('FLR', params, timeoutMs), get<DonkiCme>('CME', params, timeoutMs)]);
  return [...flares.map(mapFlare), ...cmes.map(mapCme)];
}
