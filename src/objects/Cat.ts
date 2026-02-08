import Phaser from 'phaser';
import { CAT_BREEDS } from '../constants';
import { AnimKeys } from '../systems/AnimationManager';

export type CatState = 'idle' | 'wandering' | 'following' | 'happy' | 'sleeping';

export class Cat extends Phaser.Physics.Arcade.Sprite {
  private behaviorState: CatState = 'idle';
  private stateTimer = 0;
  private wanderTarget = new Phaser.Math.Vector2();
  private bounds = new Phaser.Geom.Rectangle(80, 120, 860, 560);

  constructor(scene: Phaser.Scene, x: number, y: number, breedId: string) {
    const texture = `cat_${breedId}`;
    super(scene, x, y, texture, 0);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Smaller baseline so cat sits better next to the player sprite.
    this.setScale(3);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    body?.setSize(12, 8, true);
    body?.setOffset(10, 20);

    this.play(AnimKeys.CatIdle);
  }

  setBreed(breedId: string): void {
    const exists = CAT_BREEDS.some((breed) => `cat_${breed.id}` === `cat_${breedId}`);
    this.setTexture(exists ? `cat_${breedId}` : 'cat_orange_tabby');
  }

  setHouseBounds(rect: Phaser.Geom.Rectangle): void {
    this.bounds = rect;
  }

  private pickWanderTarget(): void {
    this.wanderTarget.set(
      Phaser.Math.Between(this.bounds.left + 20, this.bounds.right - 20),
      Phaser.Math.Between(this.bounds.top + 20, this.bounds.bottom - 20),
    );
  }

  update(deltaSeconds: number, shouldFollowPlayer: boolean, playerPosition: Phaser.Math.Vector2): void {
    this.stateTimer -= deltaSeconds;

    if (shouldFollowPlayer) {
      this.behaviorState = 'following';
      this.stateTimer = 0.2;
    } else if (this.stateTimer <= 0) {
      if (this.behaviorState === 'idle') {
        this.behaviorState = 'wandering';
        this.stateTimer = Phaser.Math.FloatBetween(1.2, 2.8);
        this.pickWanderTarget();
      } else {
        this.behaviorState = 'idle';
        this.stateTimer = Phaser.Math.FloatBetween(1.4, 2.4);
      }
    }

    const body = this.body as Phaser.Physics.Arcade.Body | null;

    if (this.behaviorState === 'following') {
      const direction = new Phaser.Math.Vector2(playerPosition.x - this.x, playerPosition.y - this.y);
      const distance = direction.length();
      if (distance > 44) {
        direction.normalize();
        this.setVelocity(direction.x * 130, direction.y * 130);
      } else {
        this.setVelocity(0, 0);
      }
      this.play(AnimKeys.CatWalk, true);
      this.setFlipX((body?.velocity.x ?? 0) < 0);
      return;
    }

    if (this.behaviorState === 'wandering') {
      const direction = new Phaser.Math.Vector2(this.wanderTarget.x - this.x, this.wanderTarget.y - this.y);
      if (direction.length() > 5) {
        direction.normalize();
        this.setVelocity(direction.x * 90, direction.y * 90);
        this.play(AnimKeys.CatWalk, true);
        this.setFlipX((body?.velocity.x ?? 0) < 0);
      } else {
        this.setVelocity(0, 0);
      }
      return;
    }

    this.setVelocity(0, 0);
    if (this.behaviorState === 'happy') {
      this.play(AnimKeys.CatHappy, true);
    } else {
      this.play(AnimKeys.CatIdle, true);
    }
  }

  reactHappy(): void {
    this.behaviorState = 'happy';
    this.stateTimer = 1.6;
  }
}
