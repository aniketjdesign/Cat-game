import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { Cat } from '../objects/Cat';
import { PixelButton } from '../ui/PixelButton';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    // warm cozy sky gradient background
    this.cameras.main.setBackgroundColor('#87CEEB');

    // sky top → warm peach at horizon
    this.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 120, 0x6bb8d8).setOrigin(0.5, 0);
    this.add.rectangle(GAME_WIDTH / 2, 120, GAME_WIDTH, 80, 0x94cce0).setOrigin(0.5, 0);
    this.add.rectangle(GAME_WIDTH / 2, 200, GAME_WIDTH, 60, 0xc8dce4).setOrigin(0.5, 0);
    this.add.rectangle(GAME_WIDTH / 2, 260, GAME_WIDTH, 40, 0xf0dcc0).setOrigin(0.5, 0);

    // rolling grass hill
    this.add.rectangle(GAME_WIDTH / 2, 300, GAME_WIDTH, GAME_HEIGHT - 300, 0x6a9e4a).setOrigin(0.5, 0);
    // grass highlight strip
    this.add.rectangle(GAME_WIDTH / 2, 300, GAME_WIDTH, 6, 0x7eb85a).setOrigin(0.5, 0);
    // darker ground strip at bottom
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 60, GAME_WIDTH, 60, 0x5a8a3e).setOrigin(0.5, 0);

    // little wooden fence posts (decorative)
    for (let fx = 40; fx < GAME_WIDTH; fx += 80) {
      this.add.rectangle(fx, 310, 6, 30, 0x8b6b42).setOrigin(0.5, 0);
      this.add.rectangle(fx, 310, 8, 3, 0xa08050).setOrigin(0.5, 0);
    }
    // fence rail
    this.add.rectangle(GAME_WIDTH / 2, 318, GAME_WIDTH, 4, 0x8b6b42).setOrigin(0.5, 0);
    this.add.rectangle(GAME_WIDTH / 2, 330, GAME_WIDTH, 4, 0x8b6b42).setOrigin(0.5, 0);

    // cozy house silhouette in background
    this.add.rectangle(GAME_WIDTH / 2, 200, 260, 100, 0x8b5e3c).setOrigin(0.5, 1);
    this.add.rectangle(GAME_WIDTH / 2, 100, 290, 50, 0xa0704a).setOrigin(0.5, 0); // roof
    // roof peak (triangle approx with rectangles)
    this.add.rectangle(GAME_WIDTH / 2, 90, 220, 14, 0xb88060).setOrigin(0.5, 0);
    this.add.rectangle(GAME_WIDTH / 2, 82, 160, 12, 0xb88060).setOrigin(0.5, 0);
    this.add.rectangle(GAME_WIDTH / 2, 74, 100, 10, 0xa0704a).setOrigin(0.5, 0);
    // window
    this.add.rectangle(GAME_WIDTH / 2 - 50, 170, 30, 30, 0xf5e6c8).setOrigin(0.5);
    this.add.rectangle(GAME_WIDTH / 2 + 50, 170, 30, 30, 0xf5e6c8).setOrigin(0.5);
    // door
    this.add.rectangle(GAME_WIDTH / 2, 180, 28, 40, 0x5c3d2e).setOrigin(0.5, 0);
    // chimney
    this.add.rectangle(GAME_WIDTH / 2 + 90, 60, 20, 40, 0x8b5e3c).setOrigin(0.5, 0);

    // title text with warm stroke
    this.add.text(GAME_WIDTH / 2, 410, 'Purrfect Home', {
      fontFamily: 'monospace',
      fontSize: '68px',
      color: '#f5e6c8',
      stroke: '#5c3d2e',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 480, 'A cozy cat life sim', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#2a1a0e',
    }).setOrigin(0.5);

    // animated cat walking across the foreground
    const cat = new Cat(this, 220, 570, 'orange_tabby');
    cat.setScale(3.8);

    this.tweens.add({
      targets: cat,
      x: 820,
      duration: 9000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    const newGame = new PixelButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 190, 'New Game', 280, 72);
    newGame.onClick(() => this.scene.start('CatSelectScene'));

    const continueButton = new PixelButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 104, 'Continue', 280, 72);
    continueButton.onClick(() => this.scene.start('HouseScene'));

    const hasSave = Boolean(localStorage.getItem('cat-game-save-v1'));
    continueButton.setAlpha(hasSave ? 1 : 0.5);
    if (!hasSave) {
      continueButton.disableInteractive();
    }
  }
}
