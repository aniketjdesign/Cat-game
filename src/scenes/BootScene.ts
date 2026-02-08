import Phaser from 'phaser';
import { AssetGenerator } from '../assets/AssetGenerator';
import { createInitialState, GameState } from '../state/GameState';
import { AnimationManager } from '../systems/AnimationManager';
import { SaveSystem } from '../systems/SaveSystem';
import { SeasonSystem } from '../systems/SeasonSystem';

export class BootScene extends Phaser.Scene {
  private readonly save = new SaveSystem();

  constructor() {
    super('BootScene');
  }

  create(): void {
    let state: GameState;
    const loaded = this.save.load();
    if (loaded.state) {
      state = loaded.state;
    } else {
      state = createInitialState();
    }

    state.seasonState.season = SeasonSystem.detectFromDate();

    this.registry.set('gameState', state);
    this.registry.set('offlineMinutes', loaded.offlineMinutes);
    this.registry.set('saveSystem', this.save);

    AssetGenerator.generate(this, state.playerProfile);
    AnimationManager.register(this);

    this.scene.start('TitleScene');
  }
}
