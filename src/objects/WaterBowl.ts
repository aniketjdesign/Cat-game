import Phaser from 'phaser';
import { Events } from '../systems/Events';
import { InteractiveObject, InteractionContext } from './InteractiveObject';

export class WaterBowl extends InteractiveObject {
  waterLevel = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, 'water_bowl', 'obj_water_bowl', x, y, 'Water Bowl', 70, 'Refill or serve');
  }

  onInteract(context: InteractionContext): void {
    if (context.player.carryingItem === 'water') {
      context.player.setCarrying(null);
      this.waterLevel = 100;
      context.cat.goDrinkAt(this.getInteractionPoint());
      context.events.emit(Events.GameplayAction, { action: 'water' });
      context.events.emit(Events.Toast, { message: 'Water refreshed' });
      return;
    }

    if (this.waterLevel <= 0) {
      context.events.emit(Events.Toast, { message: 'Need to fill water first' });
      return;
    }

    this.waterLevel = Math.max(0, this.waterLevel - 35);
    context.cat.goDrinkAt(this.getInteractionPoint());
    context.events.emit(Events.Toast, { message: 'Cat had a drink' });
  }
}
