import { DAY_MINUTES, IN_GAME_MINUTES_PER_REAL_SECOND } from '../constants';
import { TimeState } from '../state/GameState';

export class TimeSystem {
  private state: TimeState;

  constructor(initial: TimeState) {
    this.state = { ...initial };
  }

  getState(): TimeState {
    return { ...this.state };
  }

  setState(next: TimeState): void {
    this.state = { ...next };
  }

  tick(deltaSeconds: number): { state: TimeState; dayRolled: boolean; deltaMinutes: number } {
    const deltaMinutes = Math.max(0, deltaSeconds) * IN_GAME_MINUTES_PER_REAL_SECOND;
    let minuteOfDay = this.state.minuteOfDay + deltaMinutes;
    let dayRolled = false;

    while (minuteOfDay >= DAY_MINUTES) {
      minuteOfDay -= DAY_MINUTES;
      this.state.dayCount += 1;
      dayRolled = true;
    }

    this.state.minuteOfDay = minuteOfDay;
    this.state.lastUpdatedAt = Date.now();

    return {
      state: this.getState(),
      dayRolled,
      deltaMinutes,
    };
  }

  static formatClock(minuteOfDay: number): string {
    const whole = Math.floor(minuteOfDay);
    const hours24 = Math.floor(whole / 60) % 24;
    const minutes = whole % 60;
    const suffix = hours24 >= 12 ? 'PM' : 'AM';
    const h = hours24 % 12 === 0 ? 12 : hours24 % 12;
    return `${h}:${minutes.toString().padStart(2, '0')} ${suffix}`;
  }
}
