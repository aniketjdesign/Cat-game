import Phaser from 'phaser';
import { INPUT_TARGET_MIN_SIZE } from '../constants';

export class PixelButton extends Phaser.GameObjects.Container {
  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly hiEdge: Phaser.GameObjects.Rectangle;
  private readonly shEdge: Phaser.GameObjects.Rectangle;
  private readonly label: Phaser.GameObjects.Text;
  private callback: (() => void) | null = null;
  private enabled = true;

  /* warm wood / parchment palette matching the room sprite style */
  private static readonly BG = 0xf5e6c8;
  private static readonly BG_PRESS = 0xdcc8a0;
  private static readonly BORDER = 0x5c3d2e;
  private static readonly HI = 0xfaf4e4;
  private static readonly SH = 0x3e2a1e;

  constructor(scene: Phaser.Scene, x: number, y: number, text: string, width = 220, height = 64) {
    super(scene, x, y);

    const w = Math.max(width, INPUT_TARGET_MIN_SIZE);
    const h = Math.max(height, INPUT_TARGET_MIN_SIZE);

    // main body with thick pixel-art border
    this.bg = scene.add.rectangle(0, 0, w, h, PixelButton.BG).setOrigin(0.5);
    this.bg.setStrokeStyle(4, PixelButton.BORDER);

    // inner bevel – highlight along top edge
    this.hiEdge = scene.add.rectangle(0, -h / 2 + 5, w - 10, 2, PixelButton.HI).setOrigin(0.5, 0);

    // inner bevel – shadow along bottom edge
    this.shEdge = scene.add.rectangle(0, h / 2 - 7, w - 10, 2, PixelButton.SH).setOrigin(0.5, 0).setAlpha(0.3);

    this.label = scene.add.text(0, 0, text, {
      fontFamily: 'monospace',
      fontSize: h >= 64 ? '22px' : '16px',
      color: '#2a1a0e',
    }).setOrigin(0.5);

    this.add([this.bg, this.hiEdge, this.shEdge, this.label]);
    this.setSize(w, h);
    scene.add.existing(this);

    this.bg.setInteractive({ useHandCursor: true });

    this.bg.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      if (!this.enabled) return;
      event.stopPropagation();
      this.bg.setFillStyle(PixelButton.BG_PRESS);
      this.hiEdge.setVisible(false);
      this.shEdge.setAlpha(0.5);
      this.label.y = 1;
    });

    this.bg.on('pointerup', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      if (!this.enabled) return;
      event.stopPropagation();
      this.resetVisual();
      this.callback?.();
    });

    this.bg.on('pointerupoutside', () => this.resetVisual());
    this.bg.on('pointerout', () => this.resetVisual());
  }

  private resetVisual(): void {
    this.bg.setFillStyle(PixelButton.BG);
    this.hiEdge.setVisible(true);
    this.shEdge.setAlpha(0.3);
    this.label.y = 0;
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
    this.bg.disableInteractive();
    this.setAlpha(0.45);
    return this;
  }

  enable(): this {
    this.enabled = true;
    this.bg.setInteractive({ useHandCursor: true });
    this.setAlpha(1);
    return this;
  }
}
