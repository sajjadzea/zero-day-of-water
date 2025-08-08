import { useState } from 'react';
import scenarios from '../../docs/data/scenarios.json';

export type ScenarioKey = keyof typeof scenarios;

export function useScenarios() {
  const [scenarioKey, setScenarioKey] = useState<ScenarioKey>('normal');
  const scenario = scenarios[scenarioKey];

  const calcDays = (usableMm3: number) => {
    const daily = scenario.dailyDrawMm3;
    if (daily === 0) {
      return { days: 0, lower: 0, upper: 0, uncertainty: 0 };
    }
    const days = Math.round(usableMm3 / daily);
    const lower = Math.round(usableMm3 / (daily * 1.1));
    const upper = Math.round(usableMm3 / (daily * 0.9));
    const uncertainty = Math.max(days - lower, upper - days);
    return { days, lower, upper, uncertainty };
  };

  return { scenarios, scenarioKey, setScenarioKey, scenario, calcDays };
}
