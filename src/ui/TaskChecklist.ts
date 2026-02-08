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

    // backing panel
    const panelW = 196;
    const panelH = 26 + TASK_KEYS.length * 22 + 8;
    const panelBorder = scene.add.rectangle(-8, -8, panelW + 4, panelH + 4, 0x5c3d2e).setOrigin(0);
    const panel = scene.add.rectangle(-6, -6, panelW, panelH, 0x1a1410, 0.88).setOrigin(0);
    this.add([panelBorder, panel]);

    const title = scene.add.text(0, 0, 'TODAY', {
      fontFamily: 'monospace',
      fontSize: '16px',
      color: '#c49a5a',
    });
    this.add(title);

    TASK_KEYS.forEach((key, index) => {
      const line = scene.add.text(0, 24 + index * 22, `[ ] ${LABELS[key]}`, {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#f5e6c8',
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
      this.entries[key].setColor(completed ? '#6ec87a' : '#f5e6c8');
    });
  }
}
