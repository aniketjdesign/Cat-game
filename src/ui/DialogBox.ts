import Phaser from 'phaser';

export class DialogBox extends Phaser.GameObjects.Container {
  private border: Phaser.GameObjects.Rectangle;
  private bg: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, width = 500, height = 92) {
    super(scene, x, y);

    // dark wood outer border
    this.border = scene.add.rectangle(0, 0, width + 6, height + 6, 0x5c3d2e).setOrigin(0.5);

    // warm dark interior
    this.bg = scene.add.rectangle(0, 0, width, height, 0x1a1410, 0.92).setOrigin(0.5);
    this.bg.setStrokeStyle(2, 0x8b6b42);

    this.text = scene.add.text(-width / 2 + 16, -height / 2 + 12, '', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#f5e6c8',
      wordWrap: { width: width - 32 },
    });

    this.add([this.border, this.bg, this.text]);
    this.setVisible(false);
    scene.add.existing(this);
  }

  show(message: string, duration = 2400): void {
    this.text.setText(message);
    this.setVisible(true);

    this.scene.time.delayedCall(duration, () => {
      this.setVisible(false);
    });
  }
}
