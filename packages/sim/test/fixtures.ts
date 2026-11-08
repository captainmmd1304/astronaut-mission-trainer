import type { SolDecisions, WorldSnapshot } from '@amt/shared';
import type { RunConfig, SimRules } from '../src';

export const testConfig: RunConfig = { scenarioId: 'test', siteId: 'jezero', seed: 42, difficulty: 'trainee', crewSize: 4 };

export const testRules: SimRules = {
  site: { dustDeposition: 1, solarInsolation: 1, naturalShielding: 0, waterIce: 1, tempSwing: 1 },
  balance: {
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
    randomCmeChancePerSol: 0,
    doseBaselineMsvPerSol: 0.6,
    doseFailMsv: 1000,
    flareMaxMsv: 120,
    damageMsv: 40,
    shelterEffectiveness: 0.85,
    shelterMinPowered: 0.5,
    cmeHitChance: 0.5,
    o2DaysStart: 30,
    startingWaterL: 2000,
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
  },
  durationSols: 30,
  scriptedEvents: [],
};

export const calmWorld: WorldSnapshot = {
  capturedAt: '2026-01-01T00:00:00Z',
  source: 'fixture',
  lightTimeSeconds: 600,
  solarConjunction: false,
  solarEvents: [],
};

/** Sensible default: everything powered, shelter occupied only when told to. */
export const balanced = (sol: number, over: Partial<SolDecisions> = {}): SolDecisions => ({
  sol,
  power: { lifeSupport: 0.3, shielding: 0.15, greenhouse: 0.25, comms: 0.1, reserve: 0.2 },
  project: null,
  eva: false,
  shelter: false,
  ...over,
});
