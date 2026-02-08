import Phaser from 'phaser';

export class PixelPanel extends Phaser.GameObjects.Container {
  readonly bg: Phaser.GameObjects.Rectangle;
  private readonly border: Phaser.GameObjects.Rectangle;
  private readonly hiEdge: Phaser.GameObjects.Rectangle;

  constructor(scene: Phaser.Scene, x: number, y: number, width: number, height: number, color = 0x2a1e14) {
    super(scene, x, y);

    // outer dark-wood border
    this.border = scene.add.rectangle(0, 0, width + 6, height + 6, 0x5c3d2e).setOrigin(0.5);

    // main panel fill
    this.bg = scene.add.rectangle(0, 0, width, height, color, 0.92).setOrigin(0.5);
    this.bg.setStrokeStyle(2, 0x8b6b42);

    // top inner highlight
    this.hiEdge = scene.add.rectangle(0, -height / 2 + 3, width - 6, 1, 0xa08050).setOrigin(0.5, 0).setAlpha(0.4);

    this.add([this.border, this.bg, this.hiEdge]);
    scene.add.existing(this);
  }

  setSizePixels(width: number, height: number): this {
    this.bg.setSize(width, height);
    this.border.setSize(width + 6, height + 6);
    return this;
  }
}
