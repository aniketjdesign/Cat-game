import Phaser from 'phaser';
import { TASK_KEYS, TaskKey } from '../constants';
import { TaskState } from '../state/GameState';

const LABELS: Record<TaskKey, string> = {
  feed: 'Feed cat',
  water: 'Fresh water',
  play: 'Playtime',
  cleanLitter: 'Clean litter',
};

export class TaskChecklist extends Phaser.GameObjects.Container {
  private entries: Record<TaskKey, Phaser.GameObjects.Text> = {} as Record<TaskKey, Phaser.GameObjects.Text>;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    const title = scene.add.text(0, 0, 'TODAY', {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#f0f0f0',
    });
    this.add(title);

    TASK_KEYS.forEach((key, index) => {
      const line = scene.add.text(0, 24 + index * 20, `[ ] ${LABELS[key]}`, {
        fontFamily: 'monospace',
        fontSize: '16px',
        color: '#f0f0f0',
      });
      this.entries[key] = line;
      this.add(line);
    });

    scene.add.existing(this);
  }

  setTasks(state: TaskState): void {
    TASK_KEYS.forEach((key) => {
      const completed = state.completed[key];
      this.entries[key].setText(`${completed ? '[x]' : '[ ]'} ${LABELS[key]}`);
      this.entries[key].setColor(completed ? '#9be564' : '#f0f0f0');
    });
  }
}
