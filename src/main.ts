import Phaser from 'phaser';
import './style.css';
import { GAME_HEIGHT, GAME_WIDTH } from './constants';
import { BootScene } from './scenes/BootScene';
import { CatSelectScene } from './scenes/CatSelectScene';
import { HouseScene } from './scenes/HouseScene';
import { ProfileScene } from './scenes/ProfileScene';
import { TitleScene } from './scenes/TitleScene';
import { UIScene } from './scenes/UIScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'app',
  backgroundColor: '#1d2f4b',
  pixelArt: true,
  roundPixels: true,
  antialias: false,
  fps: {
    target: 60,
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  scene: [BootScene, TitleScene, CatSelectScene, ProfileScene, HouseScene, UIScene],
  render: {
    pixelArt: true,
    antialias: false,
    roundPixels: true,
  },
};

new Phaser.Game(config);
