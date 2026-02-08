import Phaser from 'phaser';
import { NEED_KEYS, NeedKey } from '../constants';
import { NeedsState } from '../state/GameState';

export class NeedsBars extends Phaser.GameObjects.Container {
  private bars: Record<NeedKey, Phaser.GameObjects.Rectangle>;
  private labels: Record<NeedKey, Phaser.GameObjects.Text>;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);

    this.bars = {} as Record<NeedKey, Phaser.GameObjects.Rectangle>;
    this.labels = {} as Record<NeedKey, Phaser.GameObjects.Text>;

    NEED_KEYS.forEach((key, index) => {
      const yOffset = index * 26;
      const label = scene.add.text(0, yOffset, key.toUpperCase(), {
        fontFamily: 'monospace',
        fontSize: '14px',
        color: '#f2f2f2',
      }).setOrigin(0, 0.5);

      const track = scene.add.rectangle(120, yOffset, 120, 14, 0x333333).setOrigin(0, 0.5);
      const fill = scene.add.rectangle(120, yOffset, 120, 12, 0x5ddc66).setOrigin(0, 0.5);

      this.add([label, track, fill]);
      this.bars[key] = fill;
      this.labels[key] = label;
    });

    scene.add.existing(this);
  }

  setNeeds(needs: NeedsState): void {
    NEED_KEYS.forEach((key) => {
      const value = Phaser.Math.Clamp(needs[key], 0, 100);
      const width = 1.2 * value;
      this.bars[key].width = width;

      const color = value < 20 ? 0xe33d3d : value < 40 ? 0xe5bb3c : 0x5ddc66;
      this.bars[key].setFillStyle(color);
      this.labels[key].setText(`${key.toUpperCase()} ${Math.round(value)}`);
    });
  }
}
