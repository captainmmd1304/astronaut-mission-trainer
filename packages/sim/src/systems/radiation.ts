import type { System } from '../types';

/**
 * Radiation system.
 * TODO:
 *  - baseline dose per sol = doseBaselineMsvPerSol * (1 - naturalShielding - shieldingLevel effect)
 *  - flare/CME active effect adds a spike scaled by (1 - protection); decisions.shelter greatly reduces it
 *  - 'shielding-upgrade' project raises shieldingLevel when finished (cost: power + time)
 *  - emit 'radiation-spike' (cause: the solar event) and 'dose-threshold-crossed'
 *  - warning timing depends on world.lightTimeSeconds and comms link (Commander difficulty)
 */
export const radiationSystem: System = (state) => ({ state, events: [] });
