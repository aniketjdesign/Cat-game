import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { Cat } from '../objects/Cat';
import { PixelButton } from '../ui/PixelButton';

export class TitleScene extends Phaser.Scene {
  constructor() {
    super('TitleScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#68d8f3');
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT * 0.74, GAME_WIDTH, GAME_HEIGHT * 0.52, 0xa8d972);

    this.add.text(GAME_WIDTH / 2, 100, 'Purrfect Home', {
      fontFamily: 'monospace',
      fontSize: '68px',
      color: '#ffffff',
      stroke: '#35516b',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.add.text(GAME_WIDTH / 2, 170, 'Full-screen cozy cat life sim', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#174057',
    }).setOrigin(0.5);

    const cat = new Cat(this, 220, 540, 'orange_tabby');
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
