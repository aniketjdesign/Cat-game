import { describe, expect, test, beforeEach } from 'vitest';
import { createInitialState } from '../state/GameState';
import { NeedsSystem } from '../systems/NeedsSystem';
import { TaskManager } from '../systems/TaskManager';
import { SaveSystem } from '../systems/SaveSystem';
import { GrowthSystem } from '../systems/GrowthSystem';
import { SeasonSystem } from '../systems/SeasonSystem';

class MemoryStorage {
  private data = new Map<string, string>();

  getItem(key: string): string | null {
    return this.data.has(key) ? this.data.get(key)! : null;
  }

  setItem(key: string, value: string): void {
    this.data.set(key, value);
  }

  removeItem(key: string): void {
    this.data.delete(key);
  }
}

beforeEach(() => {
  // @ts-expect-error test runtime injection
  globalThis.localStorage = new MemoryStorage();
});

describe('NeedsSystem', () => {
  test('decays needs over time', () => {
    const needs = new NeedsSystem({ hunger: 100, thirst: 100, fun: 100, hygiene: 100 });
    const result = needs.tick(60, 'orange_tabby');
    expect(result.hunger).toBeLessThan(100);
    expect(result.thirst).toBeLessThan(100);
  });
});

describe('TaskManager', () => {
  test('tracks completion and reset', () => {
    const state = createInitialState();
    const manager = new TaskManager(state.taskState);
    manager.markCompleted('feed');
    manager.markCompleted('water');
    manager.markCompleted('play');
    const result = manager.markCompleted('cleanLitter');
    expect(result.allComplete).toBe(true);

    const next = manager.startNextDay();
    expect(next.day).toBe(2);
    expect(next.completed.feed).toBe(false);
  });
});

describe('SaveSystem', () => {
  test('round-trips game state', () => {
    const state = createInitialState();
    const save = new SaveSystem('test-save');
    state.playerProfile.name = 'Rin';
    save.save(state);

    const loaded = save.load();
    expect(loaded.state.playerProfile.name).toBe('Rin');
  });
});

describe('GrowthSystem', () => {
  test('promotes to adult at day 14', () => {
    const growth = new GrowthSystem();
    expect(growth.computeGrowthStage(13)).toBe('kitten');
    expect(growth.computeGrowthStage(14)).toBe('adult');
  });
});

describe('SeasonSystem', () => {
  test('maps month to season', () => {
    expect(SeasonSystem.detectFromDate(new Date('2026-01-15'))).toBe('winter');
    expect(SeasonSystem.detectFromDate(new Date('2026-07-15'))).toBe('summer');
  });
});
