import { SAVE_KEY } from '../constants';
import { createInitialState, GameState, SavePayload } from '../state/GameState';

const SAVE_VERSION = 1;
const MAX_OFFLINE_MINUTES = 12 * 60;

export class SaveSystem {
  constructor(private readonly key = SAVE_KEY) {}

  load(): { state: GameState; offlineMinutes: number } {
    const fallback = createInitialState();
    const raw = localStorage.getItem(this.key);

    if (!raw) {
      return { state: fallback, offlineMinutes: 0 };
    }

    try {
      const parsed = JSON.parse(raw) as SavePayload;
      if (parsed.saveVersion !== SAVE_VERSION) {
        return { state: fallback, offlineMinutes: 0 };
      }

      const now = Date.now();
      const minutes = Math.max(0, Math.floor((now - parsed.lastSavedAt) / 60000));
      const offlineMinutes = Math.min(minutes, MAX_OFFLINE_MINUTES);

      const state: GameState = {
        // Older saves may not contain newly added profile fields.
        playerProfile: {
          ...fallback.playerProfile,
          ...parsed.playerProfile,
        },
        catProfile: parsed.catProfile,
        needsState: parsed.needsState,
        taskState: parsed.taskState,
        timeState: parsed.timeState,
        bondState: parsed.bondState,
        achievementState: parsed.achievementState,
        economyState: parsed.economyState,
        seasonState: parsed.seasonState,
        houseDecorState: parsed.houseDecorState,
      };

      return {
        state,
        offlineMinutes,
      };
    } catch {
      return { state: fallback, offlineMinutes: 0 };
    }
  }

  save(state: GameState): void {
    const payload: SavePayload = {
      saveVersion: SAVE_VERSION,
      playerProfile: state.playerProfile,
      catProfile: state.catProfile,
      needsState: state.needsState,
      taskState: state.taskState,
      timeState: state.timeState,
      bondState: state.bondState,
      growthState: state.catProfile.growthStage,
      achievementState: state.achievementState,
      economyState: state.economyState,
      seasonState: state.seasonState,
      houseDecorState: state.houseDecorState,
      lastSavedAt: Date.now(),
    };

    localStorage.setItem(this.key, JSON.stringify(payload));
  }

  clear(): void {
    localStorage.removeItem(this.key);
  }
}
