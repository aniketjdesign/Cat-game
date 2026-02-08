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
    this.cameras.main.setBackgroundColor('#182235');

    this.add.text(GAME_WIDTH / 2, 70, 'Choose Your Cat', {
      fontFamily: 'monospace',
      fontSize: '52px',
      color: '#f7f7f7',
    }).setOrigin(0.5);

    const preview = this.add.sprite(GAME_WIDTH / 2, 320, `cat_${CAT_BREEDS[0].id}`, 0).setScale(6.3);
    let previewFrame = 0;
    this.time.addEvent({
      delay: 220,
      loop: true,
      callback: () => {
        previewFrame = (previewFrame + 1) % 4;
        preview.setFrame(previewFrame);
      },
    });

    const breedName = this.add.text(GAME_WIDTH / 2, 470, CAT_BREEDS[0].name, {
      fontFamily: 'monospace',
      fontSize: '38px',
      color: '#ffffff',
    }).setOrigin(0.5);

    const blurb = this.add.text(GAME_WIDTH / 2, 520, CAT_BREEDS[0].blurb, {
      fontFamily: 'monospace',
      fontSize: '21px',
      color: '#d8e8ff',
      wordWrap: { width: 760 },
      align: 'center',
    }).setOrigin(0.5);

    const carousel = new Carousel(this, GAME_WIDTH / 2, 610, CAT_BREEDS.map((breed) => breed.name));
    carousel.onChange((index) => {
      this.selectedIndex = index;
      const breed = CAT_BREEDS[index];
      preview.setTexture(`cat_${breed.id}`);
      previewFrame = 0;
      preview.setFrame(0);
      breedName.setText(breed.name);
      blurb.setText(breed.blurb);
    });

    const button = new PixelButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 70, 'Choose This Cat', 360, 72);
    button.onClick(() => {
      const state = this.registry.get('gameState');
      state.catProfile.breedId = CAT_BREEDS[this.selectedIndex].id;
      this.registry.set('gameState', state);
      this.scene.start('ProfileScene');
    });
  }
}
