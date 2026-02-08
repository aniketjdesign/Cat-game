export class GrowthSystem {
  computeGrowthStage(ageDays: number): 'kitten' | 'adult' {
    return ageDays >= 14 ? 'adult' : 'kitten';
  }

  computeScale(stage: 'kitten' | 'adult'): number {
    return stage === 'kitten' ? 3.4 : 4.0;
  }

  computeNeedMultiplier(stage: 'kitten' | 'adult'): number {
    return stage === 'kitten' ? 1.2 : 1;
  }
}
