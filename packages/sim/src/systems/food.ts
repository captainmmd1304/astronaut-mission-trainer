import type { System } from '../types';

/**
 * Food system.
 * TODO:
 *  - consumption = foodKcalPerCrewPerSol * crew.count from stockKcal
 *  - greenhouse yield = f(decisions.power.greenhouse * available, water, greenhouseLevel); yield lags investment
 *  - 'greenhouse-expansion' project raises greenhouseLevel
 *  - emit 'food-shortage' (cause: power diverted to shielding/comms etc.)
 */
export const foodSystem: System = (state) => ({ state, events: [] });
