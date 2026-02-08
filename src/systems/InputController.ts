import Phaser from 'phaser';

export type InputMode = 'keyboard' | 'pointer';

export interface InputSnapshot {
  mode: InputMode;
  moveX: number;
  moveY: number;
  pointerPressed: boolean;
  pointerWorld?: Phaser.Math.Vector2;
}

export class InputController {
  private keys: {
    up: Phaser.Input.Keyboard.Key;
    down: Phaser.Input.Keyboard.Key;
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
  };

  private mode: InputMode = 'pointer';
  private pointerPressed = false;

  constructor(private readonly scene: Phaser.Scene) {
    this.keys = scene.input.keyboard!.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.W,
      down: Phaser.Input.Keyboard.KeyCodes.S,
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
    }) as {
      up: Phaser.Input.Keyboard.Key;
      down: Phaser.Input.Keyboard.Key;
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
    };

    scene.input.keyboard!.on('keydown', () => {
      this.mode = 'keyboard';
    });

    scene.input.on('pointerdown', () => {
      this.mode = 'pointer';
      this.pointerPressed = true;
    });

    scene.input.on('pointerup', () => {
      this.pointerPressed = false;
    });
  }

  update(): InputSnapshot {
    const cursors = this.scene.input.keyboard!.createCursorKeys();
    const rawX =
      Number(this.keys.right.isDown || cursors.right?.isDown) - Number(this.keys.left.isDown || cursors.left?.isDown);
    const rawY = Number(this.keys.down.isDown || cursors.down?.isDown) - Number(this.keys.up.isDown || cursors.up?.isDown);

    const pointer = this.scene.input.activePointer;

    return {
      mode: this.mode,
      moveX: rawX,
      moveY: rawY,
      pointerPressed: this.pointerPressed,
      pointerWorld: pointer.worldX
        ? new Phaser.Math.Vector2(pointer.worldX, pointer.worldY)
        : undefined,
    };
  }
}
