import Phaser from 'phaser';
import { NEED_KEYS, NeedKey } from '../constants';
import { NeedsState } from '../state/GameState';

const BAR_COLORS: Record<NeedKey, number> = {
  hunger: 0xe8822a,
  thirst: 0x5cacee,
  fun: 0xe5c040,
  hygiene: 0x6ec87a,
};

export class NeedsBars extends Phaser.GameObjects.Container {
  private bars: Record<NeedKey, Phaser.GameObjects.Rectangle>;
  private labels: Record<NeedKey, Phaser.GameObjects.Text>;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.bars = {} as Record<NeedKey, Phaser.GameObjects.Rectangle>;
    this.labels = {} as Record<NeedKey, Phaser.GameObjects.Text>;

    // backing panel
    const panelBorder = scene.add.rectangle(-6, -10, 268, NEED_KEYS.length * 28 + 12, 0x5c3d2e).setOrigin(0);
    const panel = scene.add.rectangle(-4, -8, 264, NEED_KEYS.length * 28 + 8, 0x1a1410, 0.88).setOrigin(0);
    this.add([panelBorder, panel]);

    NEED_KEYS.forEach((key, index) => {
      const yOffset = index * 28;

      const label = scene.add.text(2, yOffset, key.toUpperCase(), {
        fontFamily: 'monospace',
        fontSize: '13px',
        color: '#f5e6c8',
      }).setOrigin(0, 0.5);

      // track background with dark inset look
      const trackBorder = scene.add.rectangle(118, yOffset, 124, 16, 0x3e2a1e).setOrigin(0, 0.5);
      const track = scene.add.rectangle(120, yOffset, 120, 12, 0x2a1e14).setOrigin(0, 0.5);
      const fill = scene.add.rectangle(120, yOffset, 120, 10, BAR_COLORS[key]).setOrigin(0, 0.5);

      this.add([label, trackBorder, track, fill]);
      this.bars[key] = fill;
      this.labels[key] = label;
    });

    scene.add.existing(this);
  }

  setNeeds(needs: NeedsState): void {
    NEED_KEYS.forEach((key) => {
      const value = Phaser.Math.Clamp(needs[key], 0, 100);
      const width = 1.2 * value;
      this.bars[key].width = Math.max(1, width);

      let color: number;
      if (value < 20) {
        color = 0xc83030;
      } else if (value < 40) {
        color = 0xd4a030;
      } else {
        color = BAR_COLORS[key];
      }
      this.bars[key].setFillStyle(color);
      this.labels[key].setText(`${key.toUpperCase()} ${Math.round(value)}`);
    });
  }
}
