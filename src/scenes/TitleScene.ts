import Phaser from 'phaser';
import { GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { Cat } from '../objects/Cat';
import { PixelButton } from '../ui/PixelButton';

export class TitleScene extends Phaser.Scene {
  private titleText!: Phaser.GameObjects.Text;
  private subtitleText!: Phaser.GameObjects.Text;
  private cat!: Cat;
  private newGameButton!: PixelButton;
  private continueButton!: PixelButton;
  private rotateOverlay!: Phaser.GameObjects.Container;
  private hasSave = false;
  private menuButtonsEnabled = true;

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
    this.titleText = this.add.text(GAME_WIDTH / 2, 410, 'Purrfect Home', {
      fontFamily: 'monospace',
      fontSize: '68px',
      color: '#f5e6c8',
      stroke: '#5c3d2e',
      strokeThickness: 8,
    }).setOrigin(0.5);

    this.subtitleText = this.add.text(GAME_WIDTH / 2, 480, 'A cozy cat life sim', {
      fontFamily: 'monospace',
      fontSize: '22px',
      color: '#2a1a0e',
    }).setOrigin(0.5);

    // animated cat walking across the foreground
    this.cat = new Cat(this, 220, 570, 'orange_tabby');
    this.cat.setScale(3.8);

    this.tweens.add({
      targets: this.cat,
      x: 820,
      duration: 9000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    this.newGameButton = new PixelButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 190, 'New Game', 280, 72);
    this.newGameButton.onClick(() => this.scene.start('CatSelectScene'));

    this.continueButton = new PixelButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 104, 'Continue', 280, 72);
    this.continueButton.onClick(() => this.scene.start('HouseScene'));

    this.hasSave = Boolean(localStorage.getItem('cat-game-save-v1'));
    this.continueButton.setAlpha(this.hasSave ? 1 : 0.5);
    if (!this.hasSave) {
      this.continueButton.disableInteractive();
    }

    this.createRotateOverlay();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.applyResponsiveLayout, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.applyResponsiveLayout, this);
    });
    this.applyResponsiveLayout();
  }

  private createRotateOverlay(): void {
    const blocker = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x06080f, 0.9)
      .setInteractive();
    blocker.on('pointerdown', (_pointer: Phaser.Input.Pointer, _x: number, _y: number, event: Phaser.Types.Input.EventData) => {
      event.stopPropagation();
    });

    const title = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 24, 'Rotate Device', {
      fontFamily: 'monospace',
      fontSize: '44px',
      color: '#f5ffe6',
      stroke: '#101820',
      strokeThickness: 5,
    }).setOrigin(0.5);

    const subtitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'Use landscape mode to start the game', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#dbe8ff',
    }).setOrigin(0.5);

    this.rotateOverlay = this.add.container(0, 0, [blocker, title, subtitle]);
    this.rotateOverlay.setDepth(1000);
    this.rotateOverlay.setVisible(false);
  }

  private setMenuButtonsEnabled(enabled: boolean): void {
    if (this.menuButtonsEnabled === enabled) {
      return;
    }

    if (enabled) {
      this.newGameButton.enable();
      this.newGameButton.setAlpha(1);

      if (this.hasSave) {
        this.continueButton.enable();
        this.continueButton.setAlpha(1);
      } else {
        this.continueButton.disableInteractive();
        this.continueButton.setAlpha(0.5);
      }
    } else {
      this.newGameButton.disableInteractive();
      this.newGameButton.setAlpha(0.5);
      this.continueButton.disableInteractive();
      this.continueButton.setAlpha(this.hasSave ? 0.5 : 0.4);
    }

    this.menuButtonsEnabled = enabled;
  }

  private applyResponsiveLayout(): void {
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const shortEdge = Math.min(window.innerWidth, window.innerHeight);
    const isMobileLike = coarsePointer && shortEdge <= 960;
    const isLandscape = window.innerWidth > window.innerHeight;
    const mobileLandscape = isMobileLike && isLandscape;
    const mobilePortrait = isMobileLike && !isLandscape;

    const displayScale = Math.min(this.scale.displaySize.width / GAME_WIDTH, this.scale.displaySize.height / GAME_HEIGHT);
    const buttonScale = mobileLandscape ? Phaser.Math.Clamp(82 / Math.max(36, 72 * displayScale), 1.05, 1.8) : 1;
    const textScale = mobileLandscape ? Phaser.Math.Clamp(30 / Math.max(16, 22 * displayScale), 1.08, 1.6) : 1;

    const continueY = GAME_HEIGHT - 84 * buttonScale;
    const newGameY = continueY - 96 * buttonScale;
    this.newGameButton.setScale(buttonScale).setPosition(GAME_WIDTH / 2, newGameY);
    this.continueButton.setScale(buttonScale).setPosition(GAME_WIDTH / 2, continueY);

    this.titleText.setScale(textScale).setPosition(GAME_WIDTH / 2, mobileLandscape ? 400 : 410);
    this.subtitleText.setScale(textScale).setPosition(GAME_WIDTH / 2, mobileLandscape ? 488 : 480);

    this.cat.setScale(mobileLandscape ? 4.25 : 3.8);

    this.rotateOverlay.setVisible(mobilePortrait);
    this.setMenuButtonsEnabled(!mobilePortrait);
  }
}
