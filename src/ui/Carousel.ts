import Phaser from 'phaser';
import { IconButton } from './IconButton';

export class Carousel extends Phaser.GameObjects.Container {
  private index = 0;
  private readonly items: string[];
  private readonly label: Phaser.GameObjects.Text;
  private onChangeCallback: ((index: number) => void) | null = null;
  private dragStartX = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, items: string[]) {
    super(scene, x, y);
    this.items = items;

    const left = new IconButton(scene, -220, 0, '<');
    const right = new IconButton(scene, 220, 0, '>');
    this.label = scene.add.text(0, 0, this.items[0] ?? '', {
      fontFamily: 'monospace',
      fontSize: '32px',
      color: '#f8f8f8',
    }).setOrigin(0.5);

    left.onClick(() => this.shift(-1));
    right.onClick(() => this.shift(1));

    this.add([left, right, this.label]);
    scene.add.existing(this);

    scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.dragStartX = pointer.x;
    });

    scene.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      const dx = pointer.x - this.dragStartX;
      if (Math.abs(dx) > 50) {
        this.shift(dx > 0 ? -1 : 1);
      }
    });
  }

  private shift(direction: number): void {
    if (!this.items.length) {
      return;
    }

    this.index = Phaser.Math.Wrap(this.index + direction, 0, this.items.length);
    this.label.setText(this.items[this.index]);
    this.onChangeCallback?.(this.index);
  }

  setIndex(index: number): void {
    this.index = Phaser.Math.Clamp(index, 0, Math.max(0, this.items.length - 1));
    this.label.setText(this.items[this.index] ?? '');
  }

  onChange(callback: (index: number) => void): this {
    this.onChangeCallback = callback;
    return this;
  }

  getIndex(): number {
    return this.index;
  }
}
