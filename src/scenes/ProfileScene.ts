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
  private nameInput!: TextInput;
  private catNameInput!: TextInput;
  private cyclePronounButton!: PixelButton;
  private startButton!: PixelButton;
  private stepperButtons: PixelButton[] = [];
  private scalableTexts: Phaser.GameObjects.Text[] = [];
  private playerPreview!: Phaser.GameObjects.Sprite;
  private catPreview!: Phaser.GameObjects.Sprite;
  private rotateOverlay!: Phaser.GameObjects.Container;
  private controlsEnabled = true;

  constructor() {
    super('ProfileScene');
  }

  create(): void {
    // warm dark background matching the cozy palette
    this.cameras.main.setBackgroundColor('#1a1410');
    const state = this.registry.get('gameState');

    // Ensure legacy saves have the new profile fields.
    if (!state.playerProfile.gender) {
      state.playerProfile.gender = 'neutral';
    }

    // wood border frame
    this.add.rectangle(GAME_WIDTH / 2, 0, GAME_WIDTH, 8, 0x5c3d2e).setOrigin(0.5, 0);
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT - 8, GAME_WIDTH, 8, 0x5c3d2e).setOrigin(0.5, 0);
    this.add.rectangle(0, GAME_HEIGHT / 2, 8, GAME_HEIGHT, 0x5c3d2e).setOrigin(0, 0.5);
    this.add.rectangle(GAME_WIDTH - 8, GAME_HEIGHT / 2, 8, GAME_HEIGHT, 0x5c3d2e).setOrigin(0, 0.5);

    // inner panel area
    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH - 40, GAME_HEIGHT - 40, 0x2a1e14).setOrigin(0.5)
      .setStrokeStyle(2, 0x8b6b42);

    // title
    const title = this.add.text(GAME_WIDTH / 2, 46, 'Create Your Character', {
      fontFamily: 'monospace',
      fontSize: '42px',
      color: '#f5e6c8',
      stroke: '#5c3d2e',
      strokeThickness: 4,
    }).setOrigin(0.5);
    this.scalableTexts.push(title);

    // decorative divider under title
    this.add.rectangle(GAME_WIDTH / 2, 76, 400, 2, 0x8b6b42).setOrigin(0.5);

    // preview showcase frame (left side)
    this.add.rectangle(260, 350, 240, 280, 0x5c3d2e).setOrigin(0.5);
    this.add.rectangle(260, 350, 230, 270, 0x2a1e14).setOrigin(0.5);

    this.playerPreview = this.add.sprite(260, 330, 'player_sheet', 0).setScale(7);
    this.tweens.add({
      targets: this.playerPreview,
      y: 340,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.inOut',
    });

    this.catPreview = this.add.sprite(380, 420, `cat_${state.catProfile.breedId}`, 0).setScale(4);
    let catPreviewFrame = 0;
    this.time.addEvent({
      delay: 220,
      loop: true,
      callback: () => {
        catPreviewFrame = (catPreviewFrame + 1) % 4;
        this.catPreview.setFrame(catPreviewFrame);
      },
    });

    const refreshPlayerPreview = () => {
      generatePlayerSprite(this, state.playerProfile, 'player_preview_sheet');
      this.playerPreview.setTexture('player_preview_sheet');
      this.playerPreview.setFrame(0);
    };

    // name input labels
    const playerNameLabel = this.add.text(544, 108, 'Player Name', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#c49a5a',
    });
    this.scalableTexts.push(playerNameLabel);

    this.nameInput = new TextInput(this, 730, 138, { width: 360, maxLength: 12, placeholder: 'Player Name' });
    this.nameInput.setValue(state.playerProfile.name);
    this.nameInput.onChange((value) => {
      state.playerProfile.name = value || state.playerProfile.name;
    });

    const catNameLabel = this.add.text(544, 178, 'Cat Name', {
      fontFamily: 'monospace',
      fontSize: '14px',
      color: '#c49a5a',
    });
    this.scalableTexts.push(catNameLabel);

    this.catNameInput = new TextInput(this, 730, 208, { width: 360, maxLength: 12, placeholder: 'Cat Name' });
    this.catNameInput.setValue(state.catProfile.name);
    this.catNameInput.onChange((value) => {
      state.catProfile.name = value || state.catProfile.name;
    });

    const pronounText = this.add.text(540, 260, `Pronouns: ${state.playerProfile.pronouns}`, {
      fontFamily: 'monospace',
      fontSize: '18px',
      color: '#f5e6c8',
    });
    this.scalableTexts.push(pronounText);

    this.cyclePronounButton = new PixelButton(this, 900, 260, 'Cycle', 90, 48);
    this.cyclePronounButton.onClick(() => {
      const idx = PRONOUNS.indexOf(state.playerProfile.pronouns);
      state.playerProfile.pronouns = PRONOUNS[(idx + 1) % PRONOUNS.length];
      pronounText.setText(`Pronouns: ${state.playerProfile.pronouns}`);
    });

    // divider before steppers
    this.add.rectangle(730, 290, 380, 1, 0x5c3d2e).setOrigin(0.5);

    const rowStartY = 310;
    const rowGap = 48;

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
        fontSize: '18px',
        color: '#f5e6c8',
      });
      this.scalableTexts.push(text);

      const left = new PixelButton(this, 848, y + 10, '<', 48, 40);
      const right = new PixelButton(this, 910, y + 10, '>', 48, 40);
      this.stepperButtons.push(left, right);

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

    this.startButton = new PixelButton(this, GAME_WIDTH / 2, GAME_HEIGHT - 48, 'Start My Life Together', 420, 72);
    this.startButton.onClick(() => {
      this.registry.set('gameState', state);
      this.scene.start('HouseScene');
    });

    this.createRotateOverlay();
    this.scale.on(Phaser.Scale.Events.RESIZE, this.applyResponsiveLayout, this);
    this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scale.off(Phaser.Scale.Events.RESIZE, this.applyResponsiveLayout, this);
    });
    this.applyResponsiveLayout();

    refreshPlayerPreview();
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

    const subtitle = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 30, 'Use landscape mode to customize your character', {
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

    const controls = [this.cyclePronounButton, this.startButton, ...this.stepperButtons];
    for (const control of controls) {
      if (enabled) {
        control.enable();
        control.setAlpha(1);
      } else {
        control.disableInteractive();
        control.setAlpha(0.5);
      }
    }

    if (!enabled) {
      this.nameInput.setFocused(false);
      this.catNameInput.setFocused(false);
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
    const controlScale = mobileLandscape ? Phaser.Math.Clamp(80 / Math.max(36, 72 * displayScale), 1.05, 1.75) : 1;
    const textScale = mobileLandscape ? Phaser.Math.Clamp(28 / Math.max(14, 18 * displayScale), 1.04, 1.45) : 1;
    const inputScale = mobileLandscape ? Phaser.Math.Clamp(58 / Math.max(30, 60 * displayScale), 1.05, 1.5) : 1;

    for (const text of this.scalableTexts) {
      text.setScale(textScale);
    }

    this.playerPreview.setScale(mobileLandscape ? 7.8 : 7);
    this.catPreview.setScale(mobileLandscape ? 4.8 : 4);

    this.nameInput.setScale(inputScale).setPosition(730, 138);
    this.catNameInput.setScale(inputScale).setPosition(730, 208);

    this.cyclePronounButton.setScale(controlScale).setPosition(900, 260);
    this.startButton.setScale(controlScale).setPosition(GAME_WIDTH / 2, GAME_HEIGHT - 56 * controlScale);

    for (const button of this.stepperButtons) {
      button.setScale(controlScale);
    }

    this.rotateOverlay.setVisible(mobilePortrait);
    this.setControlsEnabled(!mobilePortrait);
  }
}
