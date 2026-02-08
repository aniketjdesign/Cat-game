import Phaser from 'phaser';

export class PixelPanel extends Phaser.GameObjects.Container {
  readonly bg: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color = 0xd4e4a0) {
    super(scene, x, y);

    this.bg = scene.add.rectangle(0, 0, width, height, color).setOrigin(0.5);
    this.bg.setStrokeStyle(3, 0x5b6a46);

    this.add(this.bg);
    scene.add.existing(this);
  }

  setSizePixels(width: number, height: number): this {
    this.bg.setSize(width, height);
    return this;
  }
}
