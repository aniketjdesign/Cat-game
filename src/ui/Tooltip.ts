import Phaser from 'phaser';

export class Tooltip extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0);

    this.bg = scene.add.rectangle(0, 0, 160, 30, 0x111111, 0.8).setOrigin(0.5);
    this.bg.setStrokeStyle(2, 0xffffff);

    this.text = scene.add.text(0, 0, '', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#ffffff',
    }).setOrigin(0.5);

    this.add([this.bg, this.text]);
    this.setVisible(false);
    scene.add.existing(this);
  }

  show(message: string, x: number, y: number): void {
    this.text.setText(message);
    this.bg.width = Math.max(160, this.text.width + 24);
    this.setPosition(x, y);
    this.setVisible(true);
  }

  hide(): void {
    this.setVisible(false);
  }
}
