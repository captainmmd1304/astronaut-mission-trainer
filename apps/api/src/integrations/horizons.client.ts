import { LIGHT_SECONDS_PER_AU } from '@amt/shared';

export interface HorizonsRow {
  date: string;
  rangeAu: number;
  elongationDeg: number;
}

/** Parse the `$$SOE`..`$$EOE` table of a Horizons observer-table response (QUANTITIES='20,23'). */
export function parseHorizonsRows(result: string): HorizonsRow[] {
  const start = result.indexOf('$$SOE');
  const end = result.indexOf('$$EOE');
  if (start < 0 || end < 0) throw new Error('Horizons response has no data table');
  const rows: HorizonsRow[] = [];
  for (const line of result.slice(start + 5, end).split('\n')) {
    const m = line.trim().match(/^(\d{4}-\w{3}-\d{2} \d{2}:\d{2})\s+(-?[\d.]+)\s+(-?[\d.]+)\s+(-?[\d.]+)/);
    if (m) rows.push({ date: m[1]!, rangeAu: Number(m[2]), elongationDeg: Number(m[4]) });
  }
  if (rows.length === 0) throw new Error('Horizons table was empty');
  return rows;
}

export const lightTimeSeconds = (rangeAu: number) => rangeAu * LIGHT_SECONDS_PER_AU;

const iso = (d: Date) => d.toISOString().slice(0, 10);

export async function fetchHorizons(now: Date, timeoutMs = 8000): Promise<HorizonsRow[]> {
  const stop = new Date(now.getTime() + 24 * 3600 * 1000);
  const q = new URLSearchParams({
    format: 'json',
    COMMAND: "'499'",
    OBJ_DATA: "'NO'",
    MAKE_EPHEM: "'YES'",
    EPHEM_TYPE: "'OBSERVER'",
    CENTER: "'500@399'",
    START_TIME: `'${iso(now)}'`,
    STOP_TIME: `'${iso(stop)}'`,
    STEP_SIZE: "'1 d'",
    QUANTITIES: "'20,23'",
  });
  const res = await fetch(`https://ssd.jpl.nasa.gov/api/horizons.api?${q}`, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`Horizons HTTP ${res.status}`);
  const body = (await res.json()) as { result?: string };
  if (!body.result) throw new Error('Horizons returned no result');
  return parseHorizonsRows(body.result);
}
