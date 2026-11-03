import type { System } from '../types';

/**
 * Power system.
 * TODO:
 *  - generation = baseGenerationKwhPerSol * site.solarInsolation * (1 - state.power.panelDust) * (1 - dust-storm severity)
 *  - panelDust grows by site.dustDeposition each sol; 'panel-cleaning' project or EVA reduces it
 *  - availableKwh = generation + usable battery; leftover to battery up to batteryCapKwh
 *  - emit 'power-shortfall' when allocations exceed availability (cause: dust-storm effect, dusty panels)
 */
export const powerSystem: System = (state) => ({ state, events: [] });
