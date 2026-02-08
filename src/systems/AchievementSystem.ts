import { AchievementEntry, AchievementState } from '../state/GameState';

export class AchievementSystem {
  private state: AchievementState;

  constructor(initial: AchievementState) {
    this.state = {
      entries: initial.entries.map((entry) => ({ ...entry })),
    };
  }

  getState(): AchievementState {
    return {
      entries: this.state.entries.map((entry) => ({ ...entry })),
    };
  }

  unlock(id: string): AchievementEntry | null {
    const entry = this.state.entries.find((candidate) => candidate.id === id);
    if (!entry || entry.unlocked) {
      return null;
    }

    entry.unlocked = true;
    entry.unlockedAt = Date.now();
    return { ...entry };
  }
}
