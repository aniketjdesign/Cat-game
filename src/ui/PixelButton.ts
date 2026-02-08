import Phaser from 'phaser';
import { INPUT_TARGET_MIN_SIZE } from '../constants';

export class PixelButton extends Phaser.GameObjects.Container {
  private readonly rect: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;
  private callback: (() => void) | null = null;
  private enabled = true;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, width = 220, height = 64) {
    super(scene, x, y);

    const finalWidth = Math.max(width, INPUT_TARGET_MIN_SIZE);
    const finalHeight = Math.max(height, INPUT_TARGET_MIN_SIZE);

    this.rect = scene.add.rectangle(0, 0, finalWidth, finalHeight, 0xf2f3de).setOrigin(0.5);
    this.rect.setStrokeStyle(4, 0x4e5b3d);

    this.label = scene.add.text(0, 0, text, {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#1f2a16',
    }).setOrigin(0.5);

    this.add([this.rect, this.label]);
    this.setSize(finalWidth, finalHeight);
    scene.add.existing(this);

    this.rect.setInteractive({ useHandCursor: true });

    this.rect.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      if (!this.enabled) {
        return;
      }
      event.stopPropagation();
      this.rect.setFillStyle(0xdde2bc);
    });

    this.rect.on('pointerup', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      if (!this.enabled) {
        return;
      }
      event.stopPropagation();
      this.rect.setFillStyle(0xf2f3de);
      this.callback?.();
    });

    this.rect.on('pointerupoutside', () => {
      this.rect.setFillStyle(0xf2f3de);
    });

    this.rect.on('pointerout', () => {
      this.rect.setFillStyle(0xf2f3de);
    });
  }

  onClick(callback: () => void): this {
    this.callback = callback;
    return this;
  }

  setText(value: string): this {
    this.label.setText(value);
    return this;
  }

  override disableInteractive(): this {
    this.enabled = false;
    this.rect.disableInteractive();
    this.setAlpha(0.55);
    return this;
  }

  enable(): this {
    this.enabled = true;
    this.rect.setInteractive({ useHandCursor: true });
    this.setAlpha(1);
    return this;
  }
}
