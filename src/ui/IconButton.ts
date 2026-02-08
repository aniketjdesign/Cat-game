import Phaser from 'phaser';
import { PixelButton } from './PixelButton';

export class IconButton extends PixelButton {
  constructor(scene: Phaser.Scene, x: number, y: number, icon: string) {
    super(scene, x, y, icon, 64, 64);
  }
}
