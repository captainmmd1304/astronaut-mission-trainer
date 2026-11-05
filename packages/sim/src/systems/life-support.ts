import type { System } from '../types';

/** Oxygen and water. Full life-support power keeps both steady; no power drains them. */
export const lifeSupportSystem: System = (state, ctx) => {
  const b = ctx.rules.balance;
  const p = state.power.powered.lifeSupport;
  const o2Days = state.lifeSupport.o2Days - 1 + p;
  const use = b.waterUseLPerCrewPerSol * state.crew.count;
  const waterL = Math.max(0, state.lifeSupport.waterL - use * (1 - b.waterRecycleFraction * p));
  let health = state.crew.health;
  if (o2Days <= 0 || waterL <= 0) health = Math.max(0, health - b.deprivationHealthLoss);
  return { state: { ...state, lifeSupport: { o2Days: Math.max(0, o2Days), waterL }, crew: { ...state.crew, health } }, events: [] };
};
