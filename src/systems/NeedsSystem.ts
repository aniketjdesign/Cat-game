import { CAT_BREEDS, NeedKey, NEED_KEYS } from '../constants';
import { clampNeedValue, NeedsState } from '../state/GameState';

const BASE_DECAY_PER_HOUR: Record<NeedKey, number> = {
  hunger: 5,
  thirst: 7,
  fun: 4,
  hygiene: 3,
};

export class NeedsSystem {
  private readonly needs: NeedsState;

  constructor(initial: NeedsState) {
    this.needs = { ...initial };
  }

  getState(): NeedsState {
    return { ...this.needs };
  }

  setState(next: NeedsState): void {
    for (const key of NEED_KEYS) {
      this.needs[key] = clampNeedValue(next[key]);
    }
  }

  tick(deltaMinutes: number, breedId: string): NeedsState {
    const hours = Math.max(0, deltaMinutes) / 60;
    const breed = CAT_BREEDS.find((candidate) => candidate.id === breedId);

    for (const key of NEED_KEYS) {
      const multiplier = breed?.decayMultiplier[key] ?? 1;
      const decay = BASE_DECAY_PER_HOUR[key] * multiplier * hours;
      this.needs[key] = clampNeedValue(this.needs[key] - decay);
    }

    return this.getState();
  }

  modifyNeed(key: NeedKey, amount: number): NeedsState {
    this.needs[key] = clampNeedValue(this.needs[key] + amount);
    return this.getState();
  }

  applyCareAction(action: 'feed' | 'water' | 'play' | 'cleanLitter'): NeedsState {
    if (action === 'feed') {
      this.modifyNeed('hunger', 40);
    }

    if (action === 'water') {
      this.modifyNeed('thirst', 45);
    }

    if (action === 'play') {
      this.modifyNeed('fun', 35);
    }

    if (action === 'cleanLitter') {
      this.modifyNeed('hygiene', 30);
    }

    return this.getState();
  }
}
