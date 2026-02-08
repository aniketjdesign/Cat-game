import Phaser from 'phaser';
import { Events } from '../systems/Events';
import { InteractiveObject, InteractionContext } from './InteractiveObject';

export class Cabinet extends InteractiveObject {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, 'cabinet', 'obj_cabinet', x, y, 'Cabinet', 80);
  }

  onInteract(context: InteractionContext): void {
    context.player.setCarrying('food');
    context.events.emit(Events.Toast, { message: 'Picked up cat food' });
  }
}
