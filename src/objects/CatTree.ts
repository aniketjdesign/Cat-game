import Phaser from 'phaser';
import { Events } from '../systems/Events';
import { InteractiveObject, InteractionContext } from './InteractiveObject';

export class CatTree extends InteractiveObject {
  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, 'cat_tree', 'obj_cat_tree', x, y, 'Cat Tree', 86, 'Send cat to nap');
    this.interactionPoint = new Phaser.Math.Vector2(x - 6, y + 44);
  }

  onInteract(context: InteractionContext): void {
    context.cat.goSleepAt(this.getInteractionPoint());
    context.events.emit(Events.Toast, { message: 'Cat curled up on the tree' });
  }
}
