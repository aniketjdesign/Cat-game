import Phaser from 'phaser';
import { Events } from '../systems/Events';
import { InteractiveObject, InteractionContext } from './InteractiveObject';

export class FoodBowl extends InteractiveObject {
  foodLevel = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, 'food_bowl', 'obj_food_bowl', x, y, 'Food Bowl', 70, 'Refill or serve');
  }

  onInteract(context: InteractionContext): void {
    if (context.player.carryingItem === 'food') {
      context.player.setCarrying(null);
      this.foodLevel = 100;
      context.cat.goEatAt(this.getInteractionPoint());
      context.events.emit(Events.GameplayAction, { action: 'feed' });
      context.events.emit(Events.Toast, { message: 'Food refilled' });
      return;
    }

    if (this.foodLevel <= 0) {
      context.events.emit(Events.Toast, { message: 'Need cat food from cabinet' });
      return;
    }

    this.foodLevel = Math.max(0, this.foodLevel - 30);
    context.cat.goEatAt(this.getInteractionPoint());
    context.events.emit(Events.Toast, { message: 'Cat ate from bowl' });
  }
}
