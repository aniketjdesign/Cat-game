import Phaser from 'phaser';
import { CAT_BREEDS, type CatBreedId } from '../constants';
import { getCatAnimKey } from '../systems/AnimationManager';

export type CatState = 'idle' | 'wandering' | 'following' | 'playing' | 'happy' | 'sleeping';
export type CatIntentMode = 'idle' | 'follow' | 'play';

type DirectedReactionKind = 'eat' | 'drink' | 'sleep';

interface DirectedReaction {
  kind: DirectedReactionKind;
  target: Phaser.Math.Vector2;
  phase: 'moving' | 'reacting';
  timer: number;
  faceLeft: boolean;
}

export class Cat extends Phaser.Physics.Arcade.Sprite {
  private breedId: CatBreedId;
  private behaviorState: CatState = 'idle';
  private stateTimer = 0;
  private wanderTarget = new Phaser.Math.Vector2();
  private bounds = new Phaser.Geom.Rectangle(80, 120, 860, 560);
  private directedReaction: DirectedReaction | null = null;
  private playOrbitAngle = 0;
  private hopCooldown = 0;
  private hopTween: Phaser.Tweens.Tween | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, breedId: string) {
    const exists = CAT_BREEDS.some((breed) => breed.id === breedId);
    const resolvedBreed = (exists ? breedId : 'orange_tabby') as CatBreedId;
    const texture = `cat_${resolvedBreed}`;
    super(scene, x, y, texture, 0);

    this.breedId = resolvedBreed;

    scene.add.existing(this);
    scene.physics.add.existing(this);

    // Smaller baseline so cat sits better next to the player sprite.
    this.setScale(3);
    this.setCollideWorldBounds(true);

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    body?.setSize(12, 8, true);
    body?.setOffset(10, 20);

    this.play(this.catAnim('idle'));
  }

  setBreed(breedId: string): void {
    const exists = CAT_BREEDS.some((breed) => breed.id === breedId);
    this.breedId = (exists ? breedId : 'orange_tabby') as CatBreedId;
    this.setTexture(`cat_${this.breedId}`);
    this.play(this.catAnim('idle'), true);
  }

  setHouseBounds(rect: Phaser.Geom.Rectangle): void {
    this.bounds = rect;
  }

  private catAnim(kind: 'idle' | 'walk' | 'happy' | 'sleep'): string {
    return getCatAnimKey(kind, this.breedId);
  }

  private pickWanderTarget(): void {
    this.wanderTarget.set(
      Phaser.Math.Between(this.bounds.left + 20, this.bounds.right - 20),
      Phaser.Math.Between(this.bounds.top + 20, this.bounds.bottom - 20),
    );
  }

  private doHop(): void {
    if (this.hopTween?.isPlaying()) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    const startY = this.y;
    this.hopTween = this.scene.tweens.add({
      targets: this,
      y: startY - 10,
      duration: 90,
      yoyo: true,
      hold: 40,
      ease: 'Quad.out',
      onComplete: () => {
        body?.reset(this.x, startY);
      },
    });
  }

  private startDirectedReaction(kind: DirectedReactionKind, target: Phaser.Math.Vector2, durationSeconds: number): void {
    this.directedReaction = {
      kind,
      target: target.clone(),
      phase: 'moving',
      timer: durationSeconds,
      faceLeft: target.x < this.x,
    };
  }

  goEatAt(target: Phaser.Math.Vector2): void {
    this.startDirectedReaction('eat', target, 2.2);
  }

  goDrinkAt(target: Phaser.Math.Vector2): void {
    this.startDirectedReaction('drink', target, 1.8);
  }

  goSleepAt(target: Phaser.Math.Vector2): void {
    this.startDirectedReaction('sleep', target, 5.2);
  }

  reactHappy(durationSeconds = 1.6): void {
    this.directedReaction = null;
    this.behaviorState = 'happy';
    this.stateTimer = durationSeconds;
  }

  private updateDirected(deltaSeconds: number): boolean {
    if (!this.directedReaction) {
      return false;
    }

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    const reaction = this.directedReaction;

    if (reaction.phase === 'moving') {
      const direction = new Phaser.Math.Vector2(reaction.target.x - this.x, reaction.target.y - this.y);
      const distance = direction.length();
      if (distance > 8) {
        direction.normalize();
        this.setVelocity(direction.x * 110, direction.y * 110);
        this.play(this.catAnim('walk'), true);
        this.setFlipX((body?.velocity.x ?? 0) < 0);
      } else {
        this.setVelocity(0, 0);
        reaction.phase = 'reacting';
      }
      return true;
    }

    reaction.timer -= deltaSeconds;
    this.setVelocity(0, 0);
    this.setFlipX(reaction.faceLeft);

    if (reaction.kind === 'sleep') {
      this.behaviorState = 'sleeping';
      this.play(this.catAnim('sleep'), true);
    } else if (reaction.kind === 'eat') {
      this.behaviorState = 'happy';
      this.play(this.catAnim('happy'), true);
      this.hopCooldown -= deltaSeconds;
      if (this.hopCooldown <= 0) {
        this.doHop();
        this.hopCooldown = Phaser.Math.FloatBetween(0.7, 1.15);
      }
    } else {
      this.behaviorState = 'happy';
      this.play(this.catAnim('idle'), true);
    }

    if (reaction.timer <= 0) {
      this.directedReaction = null;
      this.behaviorState = 'idle';
      this.stateTimer = Phaser.Math.FloatBetween(0.8, 1.6);
    }

    return true;
  }

  update(deltaSeconds: number, mode: CatIntentMode, playerPosition: Phaser.Math.Vector2): void {
    this.stateTimer -= deltaSeconds;

    if (this.updateDirected(deltaSeconds)) {
      return;
    }

    const body = this.body as Phaser.Physics.Arcade.Body | null;

    if (mode === 'play') {
      this.behaviorState = 'playing';
      this.playOrbitAngle += deltaSeconds * 3.2;
      const radius = 56 + Math.sin(this.scene.time.now * 0.006) * 10;
      const targetX = playerPosition.x + Math.cos(this.playOrbitAngle) * radius;
      const targetY = playerPosition.y + Math.sin(this.playOrbitAngle) * radius * 0.72;
      const direction = new Phaser.Math.Vector2(targetX - this.x, targetY - this.y);

      if (direction.length() > 6) {
        direction.normalize();
        this.setVelocity(direction.x * 150, direction.y * 150);
      } else {
        this.setVelocity(0, 0);
      }

      this.play(this.catAnim('walk'), true);
      this.setFlipX((body?.velocity.x ?? 0) < 0);

      this.hopCooldown -= deltaSeconds;
      if (this.hopCooldown <= 0) {
        this.doHop();
        this.hopCooldown = Phaser.Math.FloatBetween(0.65, 1.1);
      }
      return;
    }

    if (mode === 'follow') {
      this.behaviorState = 'following';
      this.stateTimer = 0.2;
      const direction = new Phaser.Math.Vector2(playerPosition.x - this.x, playerPosition.y - this.y);
      const distance = direction.length();
      if (distance > 44) {
        direction.normalize();
        this.setVelocity(direction.x * 130, direction.y * 130);
      } else {
        this.setVelocity(0, 0);
      }
      this.play(this.catAnim('walk'), true);
      this.setFlipX((body?.velocity.x ?? 0) < 0);
      return;
    }

    if (this.stateTimer <= 0) {
      if (this.behaviorState === 'idle' || this.behaviorState === 'happy') {
        this.behaviorState = 'wandering';
        this.stateTimer = Phaser.Math.FloatBetween(1.2, 2.8);
        this.pickWanderTarget();
      } else {
        this.behaviorState = 'idle';
        this.stateTimer = Phaser.Math.FloatBetween(1.4, 2.4);
      }
    }

    if (this.behaviorState === 'wandering') {
      const direction = new Phaser.Math.Vector2(this.wanderTarget.x - this.x, this.wanderTarget.y - this.y);
      if (direction.length() > 5) {
        direction.normalize();
        this.setVelocity(direction.x * 90, direction.y * 90);
        this.play(this.catAnim('walk'), true);
        this.setFlipX((body?.velocity.x ?? 0) < 0);
      } else {
        this.setVelocity(0, 0);
      }
      return;
    }

    this.setVelocity(0, 0);
    if (this.behaviorState === 'happy') {
      this.play(this.catAnim('happy'), true);
    } else {
      this.play(this.catAnim('idle'), true);
    }
  }
}
