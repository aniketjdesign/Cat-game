import { TASK_KEYS, TaskKey } from '../constants';
import { emptyTaskCompletion, TaskState } from '../state/GameState';

export class TaskManager {
  private state: TaskState;

  constructor(initial: TaskState) {
    this.state = {
      day: initial.day,
      completed: { ...initial.completed },
    };
  }

  getState(): TaskState {
    return {
      day: this.state.day,
      completed: { ...this.state.completed },
    };
  }

  setState(next: TaskState): void {
    this.state = {
      day: next.day,
      completed: { ...next.completed },
    };
  }

  markCompleted(task: TaskKey): { state: TaskState; allComplete: boolean } {
    this.state.completed[task] = true;
    return {
      state: this.getState(),
      allComplete: this.isAllComplete(),
    };
  }

  isComplete(task: TaskKey): boolean {
    return this.state.completed[task];
  }

  isAllComplete(): boolean {
    return TASK_KEYS.every((key) => this.state.completed[key]);
  }

  startNextDay(): TaskState {
    this.state = {
      day: this.state.day + 1,
      completed: emptyTaskCompletion(),
    };

    return this.getState();
  }
}
