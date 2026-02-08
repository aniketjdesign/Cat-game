import Phaser from 'phaser';
import { Events } from '../systems/Events';
import { InteractiveObject, InteractionContext } from './InteractiveObject';

export class CatBed extends InteractiveObject {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, 'cat_bed', 'obj_cat_bed', x, y, 'Cat Bed', 82, 'Rest here');
    this.interactionPoint = new Phaser.Math.Vector2(x, y + 40);
  }

  onInteract(context: InteractionContext): void {
    context.cat.goSleepAt(this.getInteractionPoint());
    context.events.emit(Events.Toast, { message: 'Cat is taking a cozy nap' });
  }
}
