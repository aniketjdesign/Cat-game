import Phaser from 'phaser';
import { generatePlayerSprite } from '../assets/PlayerSpriteGenerator';
import {
  EYE_COLORS,
  GAME_HEIGHT,
  GAME_WIDTH,
  HAIR_COLORS,
  OUTFIT_COLORS,
  PRONOUNS,
  SKIN_TONES,
} from '../constants';
import type { PlayerProfile } from '../state/GameState';
import { PixelButton } from '../ui/PixelButton';
import { TextInput } from '../ui/TextInput';

const GENDERS: Array<PlayerProfile['gender']> = ['neutral', 'female', 'male'];
const HAIR_STYLE_LABELS = ['Short Fluffy', 'Long Side', 'Ponytail', 'Cropped'];
const OUTFIT_TYPE_LABELS = ['Tee+Jeans', 'Hoodie', 'Overalls', 'Pajamas', 'Flannel', 'Dress'];

export class ProfileScene extends Phaser.Scene {
  constructor() {
    super('ProfileScene');
  }

  create(): void {
    this.cameras.main.setBackgroundColor('#20373a');
    const state = this.registry.get('gameState');

    // Ensure legacy saves have the new profile fields.
    if (!state.playerProfile.gender) {
      state.playerProfile.gender = 'neutral';
    }

    this.add.text(GAME_WIDTH / 2, 54, 'Create Your Character', {
      fontFamily: 'monospace',
      fontSize: '46px',
      color: '#f8ffe8',
    }).setOrigin(0.5);

    const playerPreview = this.add.sprite(260, 350, 'player_sheet', 0).setScale(8);
    this.tweens.add({
      targets: playerPreview,
      y: 360,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    const catPreview = this.add.sprite(420, 420, `cat_${state.catProfile.breedId}`, 0).setScale(4.6);
    let catPreviewFrame = 0;
    this.time.addEvent({
      delay: 220,
      loop: true,
      callback: () => {
        catPreviewFrame = (catPreviewFrame + 1) % 4;
        catPreview.setFrame(catPreviewFrame);
      },
    });

    const refreshPlayerPreview = () => {
      generatePlayerSprite(this, state.playerProfile, 'player_preview_sheet');
      playerPreview.setTexture('player_preview_sheet');
      playerPreview.setFrame(0);
    };

    const nameInput = new TextInput(this, 730, 132, { width: 360, maxLength: 12, placeholder: 'Player Name' });
    nameInput.setValue(state.playerProfile.name);
    nameInput.onChange((value) => {
      state.playerProfile.name = value || state.playerProfile.name;
    });

    const catNameInput = new TextInput(this, 730, 208, { width: 360, maxLength: 12, placeholder: 'Cat Name' });
    catNameInput.setValue(state.catProfile.name);
    catNameInput.onChange((value) => {
      state.catProfile.name = value || state.catProfile.name;
    });

    const pronounText = this.add.text(540, 264, `Pronouns: ${state.playerProfile.pronouns}`, {
      fontFamily: 'monospace',
      fontSize: '20px',
      color: '#f4ffdb',
    });

    const cyclePronoun = new PixelButton(this, 900, 264, 'Cycle', 90, 48);
    cyclePronoun.onClick(() => {
      const idx = PRONOUNS.indexOf(state.playerProfile.pronouns);
      state.playerProfile.pronouns = PRONOUNS[(idx + 1) % PRONOUNS.length];
      pronounText.setText(`Pronouns: ${state.playerProfile.pronouns}`);
    });

    const rowStartY = 314;
    const rowGap = 52;

    const addStepper = (
      label: string,
      row: number,
      getter: () => number,
      setter: (value: number) => void,
      max: number,
      display: (value: number) => string,
      onChange?: () => void,
    ) => {
      const y = rowStartY + row * rowGap;
      const text = this.add.text(540, y, `${label}: ${display(getter())}`, {
        fontFamily: 'monospace',
        fontSize: '20px',
        color: '#f4ffdb',
      });

      const left = new PixelButton(this, 848, y + 10, '-', 56, 48);
      const right = new PixelButton(this, 914, y + 10, '+', 56, 48);

      const repaint = () => {
        text.setText(`${label}: ${display(getter())}`);
        refreshPlayerPreview();
        onChange?.();
      };

      left.onClick(() => {
        setter(Phaser.Math.Wrap(getter() - 1, 0, max));
        repaint();
      });

      right.onClick(() => {
        setter(Phaser.Math.Wrap(getter() + 1, 0, max));
        repaint();
      });
    };

    addStepper(
      'Gender',
      0,
      () => GENDERS.indexOf(state.playerProfile.gender),
      (v) => {
        state.playerProfile.gender = GENDERS[v % GENDERS.length];
      },
      GENDERS.length,
      (v) => GENDERS[v],
      () => {
        if (state.playerProfile.gender === 'male') {
          state.playerProfile.pronouns = 'he/him';
        } else if (state.playerProfile.gender === 'female') {
          state.playerProfile.pronouns = 'she/her';
        } else {
          state.playerProfile.pronouns = 'they/them';
        }
        pronounText.setText(`Pronouns: ${state.playerProfile.pronouns}`);
      },
    );

    addStepper('Skin Tone', 1, () => state.playerProfile.skinTone, (v) => {
      state.playerProfile.skinTone = v;
    }, SKIN_TONES.length, (v) => `${v + 1}`);

    addStepper('Hair Style', 2, () => state.playerProfile.hairStyle % HAIR_STYLE_LABELS.length, (v) => {
      state.playerProfile.hairStyle = v;
    }, HAIR_STYLE_LABELS.length, (v) => HAIR_STYLE_LABELS[v]);

    addStepper('Hair Color', 3, () => state.playerProfile.hairColor, (v) => {
      state.playerProfile.hairColor = v;
    }, HAIR_COLORS.length, (v) => `${v + 1}`);

    addStepper('Eye Color', 4, () => state.playerProfile.eyeColor, (v) => {
      state.playerProfile.eyeColor = v;
    }, EYE_COLORS.length, (v) => `${v + 1}`);

    addStepper('Outfit Type', 5, () => state.playerProfile.outfitType % OUTFIT_TYPE_LABELS.length, (v) => {
      state.playerProfile.outfitType = v;
    }, OUTFIT_TYPE_LABELS.length, (v) => OUTFIT_TYPE_LABELS[v]);

    addStepper('Outfit Color', 6, () => state.playerProfile.outfitColor, (v) => {
      state.playerProfile.outfitColor = v;
      state.houseDecorState.activeTheme = OUTFIT_COLORS[v % OUTFIT_COLORS.length];
    }, OUTFIT_COLORS.length, (v) => `${v + 1}`);

    const startButton = new PixelButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 56, 'Start My Life Together', 420, 72);
    startButton.onClick(() => {
      this.registry.set('gameState', state);
      this.scene.start('HouseScene');
    });

    refreshPlayerPreview();
  }
}
