import Phaser from 'phaser';
import { Events } from '../systems/Events';
import { InteractiveObject, InteractionContext } from './InteractiveObject';

export class Toy extends InteractiveObject {
  private active = false;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, 'toy_basket', 'obj_toy_basket', x, y, 'Toy Basket', 78, 'Start toy play');
  }

  onInteract(context: InteractionContext): void {
    this.active = !this.active;

    if (this.active) {
      context.player.setCarrying('toy');
      context.events.emit(Events.GameplayAction, { action: 'play' });
      context.events.emit(Events.Toast, { message: 'Play mode active' });
      return;
    }

    context.player.setCarrying(null);
    context.events.emit(Events.Toast, { message: 'Toy stored' });
  }
}
