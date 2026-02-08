import Phaser from 'phaser';
import { INPUT_TARGET_MIN_SIZE } from '../constants';

export interface TextInputOptions {
  width?: number;
  maxLength?: number;
  placeholder?: string;
}

export class TextInput extends Phaser.GameObjects.Container {
  private static activeInput: TextInput | null = null;

  private readonly bg: Phaser.GameObjects.Rectangle;
  private readonly textObj: Phaser.GameObjects.Text;
  private readonly caret: Phaser.GameObjects.Text;
  private focused = false;
  private value = '';
  private maxLength: number;
  private onChangeCallback: ((value: string) => void) | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, options: TextInputOptions = {}) {
    super(scene, x, y);

    const width = options.width ?? 280;
    this.maxLength = options.maxLength ?? 12;

    this.bg = scene.add.rectangle(0, 0, width, Math.max(60, INPUT_TARGET_MIN_SIZE), 0xffffff).setOrigin(0.5);
    this.bg.setStrokeStyle(3, 0x445434);

    this.textObj = scene.add.text(-width / 2 + 12, 0, options.placeholder ?? '', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#2a2a2a',
    }).setOrigin(0, 0.5);

    this.caret = scene.add.text(-width / 2 + 12, 0, '|', {
      fontFamily: 'monospace',
      fontSize: '24px',
      color: '#1a1a1a',
    }).setOrigin(0, 0.5);

    this.add([this.bg, this.textObj, this.caret]);
    this.caret.setVisible(false);

    this.setSize(width, this.bg.height);
    scene.add.existing(this);

    this.bg.setInteractive({ useHandCursor: true });

    this.bg.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
      this.setFocused(true);
    });

    scene.input.on('pointerdown', (_pointer: Phaser.Input.Pointer, hit?: Phaser.GameObjects.GameObject[]) => {
      const over = Array.isArray(hit) ? hit : [];
      if (!over.includes(this.bg)) {
        this.setFocused(false);
      }
    });

    scene.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
      if (!this.focused) {
        return;
      }

      if (event.key === 'Backspace') {
        this.value = this.value.slice(0, -1);
      } else if (event.key === 'Enter') {
        this.setFocused(false);
      } else if (event.key.length === 1 && this.value.length < this.maxLength) {
        this.value += event.key;
      }

      this.refreshText();
      this.onChangeCallback?.(this.value);
    });

    scene.time.addEvent({
      loop: true,
      delay: 450,
      callback: () => {
        this.caret.setVisible(this.focused && !this.caret.visible);
      },
    });
  }

  private refreshText(): void {
    this.textObj.setText(this.value);
    this.caret.x = this.textObj.x + this.textObj.width;
  }

  setFocused(active: boolean): void {
    if (active) {
      if (TextInput.activeInput && TextInput.activeInput !== this) {
        TextInput.activeInput.setFocused(false);
      }
      TextInput.activeInput = this;
    } else if (TextInput.activeInput === this) {
      TextInput.activeInput = null;
    }

    this.focused = active;
    this.bg.setStrokeStyle(3, active ? 0x99c15f : 0x445434);
    this.caret.setVisible(active);
  }

  setValue(value: string): void {
    this.value = value.slice(0, this.maxLength);
    this.refreshText();
  }

  getValue(): string {
    return this.value;
  }

  onChange(callback: (value: string) => void): this {
    this.onChangeCallback = callback;
    return this;
  }
}
