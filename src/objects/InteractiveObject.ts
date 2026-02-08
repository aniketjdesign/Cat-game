import Phaser from 'phaser';
import { Events } from '../systems/Events';
import { Cat } from './Cat';
import { Player } from './Player';

export interface InteractionContext {
  player: Player;
  cat: Cat;
  events: Phaser.Events.EventEmitter;
}

export abstract class InteractiveObject {
  readonly id: string;
  readonly sprite: Phaser.GameObjects.Image;
  readonly interactionZone: Phaser.GameObjects.Zone;
  readonly interactionRadiusPx: number;
  protected interactionPoint: Phaser.Math.Vector2;
  protected highlight: Phaser.GameObjects.Rectangle;
  isPlayerInRange = false;
  label: string;

  protected constructor(
    protected readonly scene: Phaser.Scene,
    id: string,
    texture: string,
    x: number,
    y: number,
    label: string,
    radius = 72,
  ) {
    this.id = id;
    this.label = label;
    this.interactionRadiusPx = radius;

    this.sprite = scene.add.image(x, y, texture).setScale(3);
    this.highlight = scene.add.rectangle(x, y + 24, 88, 20, 0xffff99, 0.2).setVisible(false);

    this.interactionZone = scene.add.zone(x, y, radius * 2, radius * 2);
    scene.physics.add.existing(this.interactionZone, true);

    this.interactionPoint = new Phaser.Math.Vector2(x, y + 46);
  }

  updateRange(player: Player): void {
    const overlapping = this.scene.physics.overlap(player, this.interactionZone);
    if (overlapping !== this.isPlayerInRange) {
      this.isPlayerInRange = overlapping;
      this.setHighlighted(overlapping);

      if (overlapping) {
        this.scene.game.events.emit(Events.InteractionEnter, { id: this.id, label: this.label, x: this.sprite.x, y: this.sprite.y - 50 });
      } else {
        this.scene.game.events.emit(Events.InteractionExit, { id: this.id });
      }
    }
  }

  setHighlighted(active: boolean): void {
    this.highlight.setVisible(active);
  }

  getInteractionPoint(): Phaser.Math.Vector2 {
    return this.interactionPoint.clone();
  }

  canInteract(_context: InteractionContext): boolean {
    return true;
  }

  abstract onInteract(context: InteractionContext): void | Promise<void>;

  destroy(): void {
    this.sprite.destroy();
    this.interactionZone.destroy();
    this.highlight.destroy();
  }
}
