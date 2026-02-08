import Phaser from 'phaser';

export class DialogBox extends Phaser.GameObjects.Container {
  private bg: Phaser.GameObjects.Rectangle;
  private text: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene, x: number, y: number, width = 500, height = 92) {
    super(scene, x, y);
    this.bg = scene.add.rectangle(0, 0, width, height, 0x121212, 0.85).setOrigin(0.5);
    this.bg.setStrokeStyle(3, 0x9eb17c);

    this.text = scene.add.text(-width / 2 + 14, -height / 2 + 10, '', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#f8f8f8',
      wordWrap: { width: width - 28 },
    });

    this.add([this.bg, this.text]);
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
