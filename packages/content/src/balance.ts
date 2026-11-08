import { BalanceSchema, type Balance } from './schema';

/**
 * Balance numbers are game abstractions (kWh, mSv, kcal are scaled for play), tuned by playtest.
 * They are NOT mission data. The simulation receives these through SimRules.balance.
 */
const trainee: Balance = {
  baseGenerationKwhPerSol: 300,
  batteryCapKwh: 600,
  startBatteryFraction: 0.8,
  lifeSupportKwhPerCrew: 20,
  shelterKwh: 40,
  greenhouseKwh: 60,
  commsKwh: 20,
  dustDepositionPerSol: 0.01,
  stormDepositionMultiplier: 4,
  stormGenerationBlock: 0.8,
  panelDustLoss: 0.8,
  evaCleanFraction: 0.7,
  evaStormRisk: 0.15,
  randomStormChancePerSol: 0.02,
  randomCmeChancePerSol: 0.12,
  doseBaselineMsvPerSol: 0.6,
  doseFailMsv: 1000,
  flareMaxMsv: 120,
  damageMsv: 40,
  shelterEffectiveness: 0.85,
  shelterMinPowered: 0.5,
  cmeHitChance: 0.5,
  o2DaysStart: 12,
  startingWaterL: 700,
  waterUseLPerCrewPerSol: 15,
  waterRecycleFraction: 0.9,
  foodKcalPerCrewPerSol: 2500,
  startingFoodKcal: 500_000,
  startGreenhouseLevel: 0.3,
  greenhouseKcalPerLevel: 20_000,
  starvationHealthLoss: 0.1,
  deprivationHealthLoss: 0.25,
  projectSols: { 'shielding-upgrade': 5, 'greenhouse-expansion': 5, 'panel-cleaning': 3, 'battery-bank': 6 },
  batteryLowFraction: 0.4,
  evaPostponeDustThreshold: 0.25,
};

const commander: Balance = {
  ...trainee,
  startBatteryFraction: 0.6,
  randomStormChancePerSol: 0.05,
  randomCmeChancePerSol: 0.25,
  cmeHitChance: 0.7,
  dustDepositionPerSol: 0.018,
  stormGenerationBlock: 0.85,
  evaCleanFraction: 0.6,
  evaStormRisk: 0.15,
  greenhouseKwh: 70,
  flareMaxMsv: 160,
  shelterEffectiveness: 0.8,
  o2DaysStart: 10,
  startingWaterL: 550,
  startingFoodKcal: 300_000,
  startGreenhouseLevel: 0.25,
};

export const balanceByDifficulty = {
  trainee: BalanceSchema.parse(trainee),
  commander: BalanceSchema.parse(commander),
} as const;
export const getBalance = (difficulty: keyof typeof balanceByDifficulty) => balanceByDifficulty[difficulty];
