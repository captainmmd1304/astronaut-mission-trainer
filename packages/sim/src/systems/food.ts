import type { System } from '../types';
import { Emitter } from '../events/helpers';

export const foodSystem: System = (state, ctx) => {
  const b = ctx.rules.balance;
  const em = new Emitter(state.sol, ctx.priorEvents);
  const causes = { ...state.causes };
  const flags = { ...state.flags };

  const produced = state.food.greenhouseLevel * b.greenhouseKcalPerLevel * state.power.powered.greenhouse;
  const eaten = b.foodKcalPerCrewPerSol * state.crew.count;
  const stock = Math.max(0, state.food.stockKcal + produced - eaten);
  let health = state.crew.health;

  if (stock <= 0) {
    health = Math.max(0, health - b.starvationHealthLoss);
    if (!flags['foodShort']) {
      const ev = em.emit('food-shortage', 'food-shortage', [causes['power-shortfall']], {});
      causes['food-shortage'] = ev.id;
      flags['foodShort'] = true;
    }
  } else flags['foodShort'] = false;

  return { state: { ...state, food: { ...state.food, stockKcal: stock }, crew: { ...state.crew, health }, causes, flags }, events: em.events };
};
