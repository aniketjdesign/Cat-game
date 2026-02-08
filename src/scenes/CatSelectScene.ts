import Phaser from 'phaser';
import { CAT_BREEDS, GAME_HEIGHT, GAME_WIDTH } from '../constants';
import { PixelButton } from '../ui/PixelButton';
import { Carousel } from '../ui/Carousel';

export class CatSelectScene extends Phaser.Scene {
  private selectedIndex = 0;

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
    this.add.text(GAME_WIDTH / 2, 60, 'Choose Your Cat', {
      fontFamily: 'monospace',
      fontSize: '48px',
      color: '#f5e6c8',
      stroke: '#5c3d2e',
      strokeThickness: 4,
    }).setOrigin(0.5);

    // preview frame (dark-wood bordered showcase)
    this.add.rectangle(GAME_WIDTH / 2, 290, 210, 210, 0x5c3d2e).setOrigin(0.5);
    this.add.rectangle(GAME_WIDTH / 2, 290, 200, 200, 0x2a1e14).setOrigin(0.5);

    const preview = this.add.sprite(GAME_WIDTH / 2, 290, `cat_${CAT_BREEDS[0].id}`, 0).setScale(5.6);
    let previewFrame = 0;
    this.time.addEvent({
      delay: 220,
      loop: true,
      callback: () => {
        previewFrame = (previewFrame + 1) % 4;
        preview.setFrame(previewFrame);
      },
    });

    const breedName = this.add.text(GAME_WIDTH / 2, 420, CAT_BREEDS[0].name, {
      fontFamily: 'monospace',
      fontSize: '34px',
      color: '#f5e6c8',
    }).setOrigin(0.5);

    // decorative divider line
    this.add.rectangle(GAME_WIDTH / 2, 448, 300, 2, 0x8b6b42).setOrigin(0.5);

    const blurb = this.add.text(GAME_WIDTH / 2, 472, CAT_BREEDS[0].blurb, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#c49a5a',
      wordWrap: { width: 700 },
      align: 'center',
    }).setOrigin(0.5);

    const carousel = new Carousel(this, GAME_WIDTH / 2, 560, CAT_BREEDS.map((breed) => breed.name));
    carousel.onChange((index) => {
      this.selectedIndex = index;
      const breed = CAT_BREEDS[index];
      preview.setTexture(`cat_${breed.id}`);
      previewFrame = 0;
      preview.setFrame(0);
      breedName.setText(breed.name);
      blurb.setText(breed.blurb);
    });

    const button = new PixelButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 60, 'Choose This Cat', 360, 72);
    button.onClick(() => {
      const state = this.registry.get('gameState');
      state.catProfile.breedId = CAT_BREEDS[this.selectedIndex].id;
      this.registry.set('gameState', state);
      this.scene.start('ProfileScene');
    });
  }
}
