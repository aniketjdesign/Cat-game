import Phaser from 'phaser';
import { Events } from '../systems/Events';
import { InteractiveObject, InteractionContext } from './InteractiveObject';

export class LitterBox extends InteractiveObject {
  dirtyLevel = 20;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, 'litter_box', 'obj_litter_box', x, y, 'Litter Box', 84);
  }

  increaseDirt(amount: number): void {
    this.dirtyLevel = Phaser.Math.Clamp(this.dirtyLevel + amount, 0, 100);
  }

  onInteract(context: InteractionContext): void {
    this.dirtyLevel = 0;
    context.events.emit(Events.GameplayAction, { action: 'cleanLitter' });
    context.events.emit(Events.Toast, { message: 'Litter cleaned' });
  }
}
