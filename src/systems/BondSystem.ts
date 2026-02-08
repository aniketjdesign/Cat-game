import { BondState } from '../state/GameState';

const TIERS = [0, 30, 70, 120] as const;

export class BondSystem {
  private state: BondState;

  constructor(initial: BondState) {
    this.state = { ...initial };
  }

  getState(): BondState {
    return { ...this.state };
  }

  add(amount: number): { state: BondState; tierIncreased: boolean } {
    const previousTier = this.state.tier;
    this.state.value = Math.max(0, this.state.value + amount);

    if (this.state.value >= TIERS[3]) {
      this.state.tier = 3;
    } else if (this.state.value >= TIERS[2]) {
      this.state.tier = 2;
    } else if (this.state.value >= TIERS[1]) {
      this.state.tier = 1;
    } else {
      this.state.tier = 0;
    }

    return {
      state: this.getState(),
      tierIncreased: this.state.tier > previousTier,
    };
  }
}
