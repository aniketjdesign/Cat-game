import Phaser from 'phaser';
import { PATH_ARRIVAL_THRESHOLD, PLAYER_SPEED } from '../constants';
import { AnimKeys } from '../systems/AnimationManager';

export type CarryingItem = 'food' | 'water' | 'toy' | null;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private moveAxis = new Phaser.Math.Vector2(0, 0);
  private path: Phaser.Math.Vector2[] = [];
  private waypointIndex = 0;
  carryingItem: CarryingItem = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'player_sheet', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(4);
    this.setCollideWorldBounds(true);
    this.play(AnimKeys.PlayerIdle);

    const body = this.body as Phaser.Physics.Arcade.Body | null;
    body?.setSize(10, 8, true);
    body?.setOffset(11, 20);
  }

  setMoveAxis(x: number, y: number): void {
    this.moveAxis.set(x, y).normalize();
    if (Math.abs(x) > 0 || Math.abs(y) > 0) {
      this.clearPath();
    }
  }

  followPath(points: Phaser.Math.Vector2[]): void {
    this.path = points;
    this.waypointIndex = 0;
  }

  clearPath(): void {
    this.path = [];
    this.waypointIndex = 0;
  }

  hasPath(): boolean {
    return this.waypointIndex < this.path.length;
  }

  getCurrentPathTarget(): Phaser.Math.Vector2 | null {
    return this.path[this.waypointIndex] ?? null;
  }

  setCarrying(item: CarryingItem): void {
    this.carryingItem = item;
  }

  update(): void {
    let velocityX = 0;
    let velocityY = 0;

    if (this.moveAxis.lengthSq() > 0) {
      velocityX = this.moveAxis.x * PLAYER_SPEED;
      velocityY = this.moveAxis.y * PLAYER_SPEED;
    } else if (this.hasPath()) {
      const waypoint = this.path[this.waypointIndex];
      const distance = Phaser.Math.Distance.Between(this.x, this.y, waypoint.x, waypoint.y);

      if (distance <= PATH_ARRIVAL_THRESHOLD) {
        this.waypointIndex += 1;
        if (!this.hasPath()) {
          velocityX = 0;
          velocityY = 0;
        }
      }

      const next = this.path[this.waypointIndex];
      if (next) {
        const direction = new Phaser.Math.Vector2(next.x - this.x, next.y - this.y).normalize();
        velocityX = direction.x * PLAYER_SPEED;
        velocityY = direction.y * PLAYER_SPEED;
      }
    }

    this.setVelocity(velocityX, velocityY);

    if (Math.abs(velocityX) > 0 || Math.abs(velocityY) > 0) {
      if (!this.anims.isPlaying || this.anims.currentAnim?.key !== AnimKeys.PlayerWalk) {
        this.play(AnimKeys.PlayerWalk, true);
      }
    } else if (!this.anims.isPlaying || this.anims.currentAnim?.key !== AnimKeys.PlayerIdle) {
      this.play(AnimKeys.PlayerIdle, true);
    }

    if (velocityX < -1) {
      this.setFlipX(true);
    }

    if (velocityX > 1) {
      this.setFlipX(false);
    }
  }
}
