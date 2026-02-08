import Phaser from 'phaser';
import { PixelButton } from './PixelButton';

export interface SelectionOption {
  label: string;
  value: number;
}

export class SelectionGrid extends Phaser.GameObjects.Container {
  private buttons: PixelButton[] = [];
  private onSelectCallback: ((value: number) => void) | null = null;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    options: SelectionOption[],
    columns: number,
  ) {
    super(scene, x, y);

    options.forEach((option, index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const button = new PixelButton(scene, col * 170, row * 74, option.label, 160, 64);
      button.onClick(() => this.onSelectCallback?.(option.value));
      this.buttons.push(button);
      this.add(button);
    });

    scene.add.existing(this);
  }

  onSelect(callback: (value: number) => void): this {
    this.onSelectCallback = callback;
    return this;
  }
}
