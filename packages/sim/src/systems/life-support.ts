import type { System } from '../types';

/**
 * Life support system.
 * TODO:
 *  - power need = lifeSupportKwhPerCrew * crew.count; fraction funded = allocation * available / need
 *  - underfunded => o2Days and waterL drain faster; emit 'life-support-deficit' with cause 'power-shortfall'
 *  - crew.health decreases when o2Days or waterL hit zero
 */
export const lifeSupportSystem: System = (state) => ({ state, events: [] });
