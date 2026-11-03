import { LandingSiteSchema, type LandingSite } from '../schema';

/**
 * Landing sites. All modifier numbers are TODO(balance) placeholders (1.0 = baseline).
 * `real: true` sites need specific, citable sources; replace the generic NASA link below.
 * Archetype sites (`real: false`) represent a terrain type and need no sources.
 */
const raw: LandingSite[] = [
  {
    id: 'jezero',
    planet: 'mars',
    name: 'Jezero Crater',
    terrain: 'mixed',
    real: true,
    latDeg: 18.44, // landing site (Octavia E. Butler Landing); NASA describes Jezero as "about 18 degrees latitude, 77 degrees longitude"
    lonDeg: 77.45,
    blurb: 'Ancient river delta, landing site of the Perseverance rover. A balanced start.',
    modifiers: { dustDeposition: 1.0, solarInsolation: 1.0, naturalShielding: 0.0, waterIce: 0.5, tempSwing: 1.0 },
    look: { seed: 101, baseColor: '#b5603a', rockDensity: 0.5, roughness: 0.5 },
    sources: ['https://www.jpl.nasa.gov/news/press_kits/mars_2020/launch/mission/landing_site/'],
  },
  {
    id: 'bright-dust-plain',
    planet: 'mars',
    name: 'Bright Dust Plain (archetype)',
    terrain: 'bright',
    real: false,
    latDeg: null,
    lonDeg: null,
    blurb: 'Pale, dust-covered terrain. Panels clog faster; surface stays cooler.',
    modifiers: { dustDeposition: 1.0, solarInsolation: 1.0, naturalShielding: 0.0, waterIce: 0.3, tempSwing: 1.0 }, // TODO(balance)
    look: { seed: 202, baseColor: '#d08a5a', rockDensity: 0.2, roughness: 0.3 },
    sources: [],
  },
  {
    id: 'dark-basalt-plain',
    planet: 'mars',
    name: 'Dark Basalt Plain (archetype)',
    terrain: 'dark',
    real: false,
    latDeg: null,
    lonDeg: null,
    blurb: 'Bare dark rock. Less dust on panels, bigger temperature swings.',
    modifiers: { dustDeposition: 1.0, solarInsolation: 1.0, naturalShielding: 0.0, waterIce: 0.2, tempSwing: 1.0 }, // TODO(balance)
    look: { seed: 303, baseColor: '#5a3b30', rockDensity: 0.8, roughness: 0.7 },
    sources: [],
  },
  {
    id: 'ice-rich-plain',
    planet: 'mars',
    name: 'Ice-Rich Mid-Latitude Plain (archetype)',
    terrain: 'mixed',
    real: false,
    latDeg: null,
    lonDeg: null,
    blurb: 'Water ice near the surface, but weaker sunlight and colder nights.',
    modifiers: { dustDeposition: 1.0, solarInsolation: 1.0, naturalShielding: 0.0, waterIce: 1.0, tempSwing: 1.0 }, // TODO(balance)
    look: { seed: 404, baseColor: '#c4a58e', rockDensity: 0.3, roughness: 0.4 },
    sources: [],
  },
];

export const landingSites: LandingSite[] = raw.map((s) => LandingSiteSchema.parse(s));
export const getSite = (id: string) => landingSites.find((s) => s.id === id);
