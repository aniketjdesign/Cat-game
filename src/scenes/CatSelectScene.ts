import Phaser from 'phaser';
import { CAT_BREEDS, GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { PixelButton } from '../ui/PixelButton';
import { Carousel } from '../ui/Carousel';

export class CatSelectScene extends Phaser.Scene {
  private selectedIndex = 0;
  private titleText!: Phaser.GameObjects.Text;
  private preview!: Phaser.GameObjects.Sprite;
  private breedName!: Phaser.GameObjects.Text;
  private blurb!: Phaser.GameObjects.Text;
  private carousel!: Carousel;
  private chooseButton!: PixelButton;
  private rotateOverlay!: Phaser.GameObjects.Container;
  private controlsEnabled = true;

  constructor() {
    super('CatSelectScene');
  }

  create(): void {
    // warm dark wood background
    this.cameras.main.setBackgroundColor('#1a1410');

    // decorative wood-panel border frame around the whole scene
    this.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 8, 0x5c3d2e).setOrigin(0.5, 0);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 8, GAME_WIDTH, 8, 0x5c3d2e).setOrigin(0.5, 0);
    this.add.rectangle(0, GAME_HEIGHT / 2, 8, GAME_HEIGHT, 0x5c3d2e).setOrigin(0, 0.5);
    this.add.rectangle(GAME_WIDTH - 8, GAME_HEIGHT / 2, 8, GAME_HEIGHT, 0x5c3d2e).setOrigin(0, 0.5);

    // inner warm parchment area
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 40, GAME_HEIGHT - 40, 0x2a1e14).setOrigin(0.5);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 44, GAME_HEIGHT - 44, 0x1a1410).setOrigin(0.5)
      .setStrokeStyle(2, 0x8b6b42);

    // title
    this.titleText = this.add.text(GAME_WIDTH / 2, 60, 'Choose Your Cat', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#f5e6c8',
      stroke: '#5c3d2e',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // preview frame (dark-wood bordered showcase)
    this.add.rectangle(GAME_WIDTH / 2, 290, 210, 210, 0x5c3d2e).setOrigin(0.5);
    this.add.rectangle(GAME_WIDTH / 2, 290, 200, 200, 0x2a1e14).setOrigin(0.5);

    this.preview = this.add.sprite(GAME_WIDTH / 2, 290, `cat_${CAT_BREEDS[0].id}`, 0).setScale(5.6);
    let previewFrame = 0;
    this.time.addEvent({
      delay: 220,
      loop: true,
      callback: () => {
        previewFrame = (previewFrame + 1) % 4;
        this.preview.setFrame(previewFrame);
      },
    });

    this.breedName = this.add.text(GAME_WIDTH / 2, 420, CAT_BREEDS[0].name, {
      fontFamily: 'monospace',
      fontSize: '34px',
      color: '#f5e6c8',
    }).setOrigin(0.5);

    // decorative divider line
    this.add.rectangle(GAME_WIDTH / 2, 448, 300, 2, 0x8b6b42).setOrigin(0.5);

    this.blurb = this.add.text(GAME_WIDTH / 2, 472, CAT_BREEDS[0].blurb, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#c49a5a',
      wordWrap: { width: 700 },
      align: 'center',
    }).setOrigin(0.5);

    this.carousel = new Carousel(this, GAME_WIDTH / 2, 560, CAT_BREEDS.map((breed) => breed.name));
    this.carousel.onChange((index) => {
      if (!this.controlsEnabled) {
        return;
      }
      this.selectedIndex = index;
      const breed = CAT_BREEDS[index];
      this.preview.setTexture(`cat_${breed.id}`);
      previewFrame = 0;
      this.preview.setFrame(0);
      this.breedName.setText(breed.name);
      this.blurb.setText(breed.blurb);
    });

    this.chooseButton = new PixelButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Choose This Cat', 360, 72);
    this.chooseButton.onClick(() => {
      const state = this.registry.get('gameState');
      state.catProfile.breedId = CAT_BREEDS[this.selectedIndex].id;
      this.registry.set('gameState', state);
      this.scene.start('ProfileScene');
    });

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

    const subtitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'Use landscape mode to pick your cat', {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#dbe8ff',
    }).setOrigin(0.5);

    this.rotateOverlay = this.add.container(0, 0, [blocker, title, subtitle]);
    this.rotateOverlay.setDepth(1000);
    this.rotateOverlay.setVisible(false);
  }

  private setControlsEnabled(enabled: boolean): void {
    if (this.controlsEnabled === enabled) {
      return;
    }

    this.controlsEnabled = enabled;
    this.input.enabled = enabled;

    if (enabled) {
      this.chooseButton.enable();
      this.chooseButton.setAlpha(1);
    } else {
      this.chooseButton.disableInteractive();
      this.chooseButton.setAlpha(0.5);
    }
  }

  private applyResponsiveLayout(): void {
    const coarsePointer = window.matchMedia('(pointer: coarse)').matches;
    const shortEdge = Math.min(window.innerWidth, window.innerHeight);
    const isMobileLike = coarsePointer && shortEdge <= 960;
    const isLandscape = window.innerWidth > window.innerHeight;
    const mobileLandscape = isMobileLike && isLandscape;
    const mobilePortrait = isMobileLike && !isLandscape;

    const displayScale = Math.min(this.scale.displaySize.width / GAME_WIDTH, this.scale.displaySize.height / GAME_HEIGHT);
    const controlScale = mobileLandscape ? Phaser.Math.Clamp(82 / Math.max(36, 72 * displayScale), 1.05, 1.8) : 1;
    const textScale = mobileLandscape ? Phaser.Math.Clamp(30 / Math.max(16, 22 * displayScale), 1.06, 1.5) : 1;

    this.chooseButton.setScale(controlScale).setPosition(GAME_WIDTH / 2, GAME_HEIGHT - 80 * controlScale);

    this.titleText.setScale(textScale);
    this.breedName.setScale(textScale);
    this.blurb.setScale(textScale);
    this.carousel.setScale(textScale);
    this.preview.setScale(mobileLandscape ? 6.4 : 5.6);

    this.rotateOverlay.setVisible(mobilePortrait);
    this.setControlsEnabled(!mobilePortrait);
  }
}
