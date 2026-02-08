import {
  CAT_BREEDS,
  DEFAULT_CAT_NAME,
  DEFAULT_PLAYER_NAME,
  NeedKey,
  OUTFIT_COLORS,
  TASK_KEYS,
  TaskKey,
} from '../constants';

export interface NeedsState {
  hunger: number;
  thirst: number;
  fun: number;
  hygiene: number;
}

export interface TaskState {
  day: number;
  completed: Record<TaskKey, boolean>;
}

export interface PlayerProfile {
  name: string;
  pronouns: string;
  skinTone: number;
  hairStyle: number;
  hairColor: number;
  eyeColor: number;
  outfitType: number;
  outfitColor: number;
  gender: 'male' | 'female' | 'neutral';
}

export interface CatProfile {
  breedId: string;
  name: string;
  ageDays: number;
  growthStage: 'kitten' | 'adult';
}

export interface TimeState {
  dayCount: number;
  minuteOfDay: number;
  lastUpdatedAt: number;
}

export interface BondState {
  value: number;
  tier: 0 | 1 | 2 | 3;
}

export interface AchievementEntry {
  id: string;
  title: string;
  unlocked: boolean;
  unlockedAt?: number;
}

export interface AchievementState {
  entries: AchievementEntry[];
}

export interface EconomyState {
  coins: number;
  purchasedDecorIds: string[];
}

export interface SeasonState {
  season: 'spring' | 'summer' | 'autumn' | 'winter';
}

export interface HouseDecorState {
  activeTheme: string;
}

export interface SavePayload {
  saveVersion: number;
  playerProfile: PlayerProfile;
  catProfile: CatProfile;
  needsState: NeedsState;
  taskState: TaskState;
  timeState: TimeState;
  bondState: BondState;
  growthState: CatProfile['growthStage'];
  achievementState: AchievementState;
  economyState: EconomyState;
  seasonState: SeasonState;
  houseDecorState: HouseDecorState;
  lastSavedAt: number;
}

export interface GameState {
  playerProfile: PlayerProfile;
  catProfile: CatProfile;
  needsState: NeedsState;
  taskState: TaskState;
  timeState: TimeState;
  bondState: BondState;
  achievementState: AchievementState;
  economyState: EconomyState;
  seasonState: SeasonState;
  houseDecorState: HouseDecorState;
}

export const DEFAULT_NEEDS: NeedsState = {
  hunger: 80,
  thirst: 80,
  fun: 80,
  hygiene: 80,
};

const initialAchievements: AchievementEntry[] = [
  { id: 'first_day', title: 'First Day Survived', unlocked: false },
  { id: 'week_streak', title: '7 Day Streak', unlocked: false },
  { id: 'bond_2', title: 'Trusted Companion', unlocked: false },
  { id: 'first_shop', title: 'Interior Designer', unlocked: false },
];

export function emptyTaskCompletion(): Record<TaskKey, boolean> {
  return TASK_KEYS.reduce(
    (acc, key) => {
      acc[key] = false;
      return acc;
    },
    {} as Record<TaskKey, boolean>,
  );
}

export function createInitialState(): GameState {
  return {
    playerProfile: {
      name: DEFAULT_PLAYER_NAME,
      pronouns: 'they/them',
      skinTone: 2,
      hairStyle: 0,
      hairColor: 1,
      eyeColor: 0,
      outfitType: 0,
      outfitColor: 0,
      gender: 'neutral',
    },
    catProfile: {
      breedId: CAT_BREEDS[0].id,
      name: DEFAULT_CAT_NAME,
      ageDays: 1,
      growthStage: 'kitten',
    },
    needsState: { ...DEFAULT_NEEDS },
    taskState: {
      day: 1,
      completed: emptyTaskCompletion(),
    },
    timeState: {
      dayCount: 1,
      minuteOfDay: 8 * 60,
      lastUpdatedAt: Date.now(),
    },
    bondState: {
      value: 0,
      tier: 0,
    },
    achievementState: {
      entries: initialAchievements,
    },
    economyState: {
      coins: 0,
      purchasedDecorIds: ['default'],
    },
    seasonState: {
      season: 'spring',
    },
    houseDecorState: {
      activeTheme: OUTFIT_COLORS[0],
    },
  };
}

export function clampNeedValue(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function mutateNeeds(needs: NeedsState, mutator: (key: NeedKey, value: number) => number): NeedsState {
  return {
    hunger: clampNeedValue(mutator('hunger', needs.hunger)),
    thirst: clampNeedValue(mutator('thirst', needs.thirst)),
    fun: clampNeedValue(mutator('fun', needs.fun)),
    hygiene: clampNeedValue(mutator('hygiene', needs.hygiene)),
  };
}
