import Phaser from 'phaser';

export class Tooltip extends Phaser.GameObjects.Container {
  private border: Phaser.GameObjects.Rectangle;
  private bg: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.border = scene.add.rectangle(0, 0, 174, 28, 0x5c3d2e).setOrigin(0.5);
    this.bg = scene.add.rectangle(0, 0, 170, 24, 0x1a1410, 0.92).setOrigin(0.5);
    this.bg.setStrokeStyle(1, 0x8b6b42);

    this.text = scene.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '12px',
      color: '#f5e6c8',
    }).setOrigin(0.5);

    this.add([this.border, this.bg, this.text]);
    this.setVisible(false);
    scene.add.existing(this);
  }

  show(message: string, x: number, y: number): void {
    this.text.setText(message);
    const w = Math.max(150, this.text.width + 24);
    this.bg.width = w;
    this.border.width = w + 4;
    this.setPosition(x, y);
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }
}
