import Phaser from 'phaser';
import { CAT_BREEDS } from '../constants';
import { generateCatSprites } from './CatSpriteGenerator';
import { generatePlayerSprite } from './PlayerSpriteGenerator';
import { generateRoomSprites } from './RoomSpriteGenerator';

export class AssetGenerator {
  static generate(scene: Phaser.Scene, playerConfig?: {
    skinTone: number;
    hairStyle: number;
    hairColor: number;
    eyeColor: number;
    outfitType: number;
    outfitColor: number;
    gender: 'male' | 'female' | 'neutral';
  }): void {
    generateRoomSprites(scene);
    generateCatSprites(scene);

    generatePlayerSprite(scene, playerConfig ?? {
      skinTone: 2,
      hairStyle: 0,
      hairColor: 1,
      eyeColor: 0,
      outfitType: 0,
      outfitColor: 0,
      gender: 'neutral',
    });

    for (const breed of CAT_BREEDS) {
      if (!scene.textures.exists(`portrait_${breed.id}`)) {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          continue;
        }
        ctx.fillStyle = '#152238';
        ctx.fillRect(0, 0, 64, 64);
        ctx.fillStyle = breed.primary;
        ctx.fillRect(14, 20, 36, 24);
        ctx.fillStyle = breed.secondary;
        ctx.fillRect(18, 16, 10, 8);
        ctx.fillRect(36, 16, 10, 8);
        ctx.fillStyle = breed.eye;
        ctx.fillRect(24, 28, 3, 3);
        ctx.fillRect(36, 28, 3, 3);
        scene.textures.addImage(`portrait_${breed.id}`, canvas as unknown as HTMLImageElement);
      }
    }
  }
}
