import Phaser from 'phaser';
import { CAT_BREEDS, type CatBreedId } from '../constants';

export const AnimKeys = {
  PlayerIdle: 'player_idle',
  PlayerWalk: 'player_walk',
} as const;

export type CatAnimKind = 'idle' | 'walk' | 'happy' | 'sleep';

export function getCatAnimKey(kind: CatAnimKind, breedId: CatBreedId): string {
  return `cat_${kind}_${breedId}`;
}

export class AnimationManager {
  static register(scene: Phaser.Scene, force = false): void {
    const create = (
      key: string,
      texture: string,
      start: number,
      end: number,
      frameRate: number,
      repeat = -1,
    ) => {
      if (scene.anims.exists(key) && !force) {
        return;
      }

      if (scene.anims.exists(key) && force) {
        scene.anims.remove(key);
      }

      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(texture, { start, end }),
        frameRate,
        repeat,
      });
    };

    create(AnimKeys.PlayerIdle, 'player_sheet', 0, 3, 4);
    create(AnimKeys.PlayerWalk, 'player_sheet', 4, 9, 10);

    for (const breed of CAT_BREEDS) {
      const texture = `cat_${breed.id}`;
      create(getCatAnimKey('idle', breed.id), texture, 0, 3, 4);
      create(getCatAnimKey('walk', breed.id), texture, 4, 11, 9);
      create(getCatAnimKey('happy', breed.id), texture, 48, 51, 8);
      create(getCatAnimKey('sleep', breed.id), texture, 18, 21, 3);
    }
  }
}
