import Phaser from 'phaser';
import { EYE_COLORS, HAIR_COLORS, OUTFIT_COLORS, SKIN_TONES } from '../constants';

const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 32;
const FRAME_COUNT = 20;

export interface PlayerSpriteConfig {
  skinTone: number;
  hairStyle: number; // 0=short fluffy, 1=long side, 2=ponytail, 3=cropped
  hairColor: number;
  eyeColor: number;
  outfitType: number;
  outfitColor: number;
  gender: 'male' | 'female' | 'neutral';
}

type Gender = PlayerSpriteConfig['gender'];

const DIR_FRONT = 0;
const DIR_RIGHT = 1;
const DIR_LEFT = 2;
const DIR_BACK = 3;

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const normalized =
    clean.length === 3
      ? clean.split('').map((c) => c + c).join('')
      : clean;
  const value = Number.parseInt(normalized, 16);
  return { r: (value >> 16) & 0xff, g: (value >> 8) & 0xff, b: value & 0xff };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function mixColors(a: string, b: string, amount: number): string {
  const c1 = hexToRgb(a);
  const c2 = hexToRgb(b);
  const t = Math.max(0, Math.min(1, amount));
  return rgbToHex(c1.r + (c2.r - c1.r) * t, c1.g + (c2.g - c1.g) * t, c1.b + (c2.b - c1.b) * t);
}

function px(ctx: CanvasRenderingContext2D, x: number, y: number, c: string): void {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, 1, 1);
}

function rect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, c: string): void {
  if (w > 0 && h > 0) {
    ctx.fillStyle = c;
    ctx.fillRect(x, y, w, h);
  }
}

interface Palette {
  skin: string;
  skinSh: string;
  hair: string;
  hairHi: string;
  hairSh: string;
  eye: string;
  shirt: string;
  shirtSh: string;
  shirtHi: string;
  pants: string;
  pantsSh: string;
  shoe: string;
  ol: string;
}

function buildPalette(
  skin: string,
  hair: string,
  eye: string,
  outfit: string,
  outfitType: number,
  gender: Gender,
): Palette {
  const outfitStyleTints = ['#ffffff', '#8fa8ff', '#9bbf8b', '#f4d9ff', '#f6b08c', '#ff9fc7'];
  const pantStyles = ['#1a1a22', '#1f2433', '#20342a', '#332640', '#3a2a1f', '#2d1d2f'];
  const genderTints: Record<Gender, string> = {
    male: '#c6ddff',
    female: '#ffd3e4',
    neutral: '#d7ffd4',
  };

  const styleTint = outfitStyleTints[outfitType % outfitStyleTints.length];
  const shirt = mixColors(outfit, styleTint, 0.2);
  const shirtHi = mixColors(shirt, genderTints[gender], 0.18);
  const pants = pantStyles[outfitType % pantStyles.length];

  return {
    skin,
    skinSh: mixColors(skin, '#000000', 0.15),
    hair,
    hairHi: mixColors(hair, '#ffffff', 0.18),
    hairSh: mixColors(hair, '#000000', 0.2),
    eye,
    shirt,
    shirtSh: mixColors(shirt, '#000000', 0.25),
    shirtHi,
    pants,
    pantsSh: mixColors(pants, '#000000', 0.22),
    shoe: mixColors(pants, '#000000', 0.45),
    ol: '#1a1018',
  };
}

function drawFront(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  p: Palette,
  hairStyle: number,
  legL: number,
  legR: number,
  armL: number,
  armR: number,
): void {
  // ===== HAIR (big fluffy mass) =====
  rect(ctx, ox + 4, oy + 0, 2, 1, p.ol); rect(ctx, ox + 7, oy + 0, 3, 1, p.ol); rect(ctx, ox + 12, oy + 0, 2, 1, p.ol);
  px(ctx, ox + 3, oy + 1, p.ol); rect(ctx, ox + 4, oy + 1, 2, 1, p.hair); px(ctx, ox + 6, oy + 1, p.ol);
  rect(ctx, ox + 7, oy + 1, 3, 1, p.hairHi); px(ctx, ox + 10, oy + 1, p.ol);
  rect(ctx, ox + 11, oy + 1, 2, 1, p.hair); px(ctx, ox + 13, oy + 1, p.ol);
  px(ctx, ox + 2, oy + 2, p.ol); rect(ctx, ox + 3, oy + 2, 12, 1, p.hair); px(ctx, ox + 15, oy + 2, p.ol);
  px(ctx, ox + 1, oy + 3, p.ol); rect(ctx, ox + 2, oy + 3, 14, 1, p.hair); px(ctx, ox + 16, oy + 3, p.ol);
  px(ctx, ox + 0, oy + 4, p.ol); rect(ctx, ox + 1, oy + 4, 16, 1, p.hair); px(ctx, ox + 17, oy + 4, p.ol);

  // Hair highlights
  rect(ctx, ox + 3, oy + 3, 3, 1, p.hairHi); rect(ctx, ox + 11, oy + 3, 3, 1, p.hairHi);
  rect(ctx, ox + 2, oy + 4, 2, 1, p.hairHi); rect(ctx, ox + 13, oy + 4, 2, 1, p.hairHi);

  // Row 5: widest hair + face transition
  px(ctx, ox + 0, oy + 5, p.ol); rect(ctx, ox + 1, oy + 5, 2, 1, p.hair); px(ctx, ox + 3, oy + 5, p.hairSh);
  rect(ctx, ox + 4, oy + 5, 10, 1, p.hair);
  px(ctx, ox + 14, oy + 5, p.hairSh); rect(ctx, ox + 15, oy + 5, 2, 1, p.hair); px(ctx, ox + 17, oy + 5, p.ol);

  // Row 6: hair sides + face
  px(ctx, ox + 0, oy + 6, p.ol); rect(ctx, ox + 1, oy + 6, 2, 1, p.hair); px(ctx, ox + 3, oy + 6, p.ol);
  rect(ctx, ox + 4, oy + 6, 10, 1, p.skin);
  px(ctx, ox + 14, oy + 6, p.ol); rect(ctx, ox + 15, oy + 6, 2, 1, p.hair); px(ctx, ox + 17, oy + 6, p.ol);
  // Bangs
  rect(ctx, ox + 5, oy + 6, 3, 1, p.hair); rect(ctx, ox + 10, oy + 6, 3, 1, p.hair);

  // Row 7: face with hair sides
  px(ctx, ox + 0, oy + 7, p.ol); rect(ctx, ox + 1, oy + 7, 2, 1, p.hairSh); px(ctx, ox + 3, oy + 7, p.ol);
  rect(ctx, ox + 4, oy + 7, 10, 1, p.skin);
  px(ctx, ox + 14, oy + 7, p.ol); rect(ctx, ox + 15, oy + 7, 2, 1, p.hairSh); px(ctx, ox + 17, oy + 7, p.ol);

  // Row 8: eyes
  px(ctx, ox + 1, oy + 8, p.ol); px(ctx, ox + 2, oy + 8, p.hairSh); px(ctx, ox + 3, oy + 8, p.ol);
  rect(ctx, ox + 4, oy + 8, 10, 1, p.skin);
  px(ctx, ox + 14, oy + 8, p.ol); px(ctx, ox + 15, oy + 8, p.hairSh); px(ctx, ox + 16, oy + 8, p.ol);

  // Eyes: 2x2 with highlight
  rect(ctx, ox + 6, oy + 8, 2, 2, p.eye);
  rect(ctx, ox + 10, oy + 8, 2, 2, p.eye);
  px(ctx, ox + 6, oy + 8, '#ffffff');
  px(ctx, ox + 10, oy + 8, '#ffffff');

  // Row 9: lower face
  px(ctx, ox + 2, oy + 9, p.ol); px(ctx, ox + 3, oy + 9, p.ol);
  rect(ctx, ox + 4, oy + 9, 10, 1, p.skin);
  px(ctx, ox + 14, oy + 9, p.ol); px(ctx, ox + 15, oy + 9, p.ol);
  px(ctx, ox + 9, oy + 9, p.skinSh); // nose

  // Row 10: chin
  px(ctx, ox + 3, oy + 10, p.ol); rect(ctx, ox + 4, oy + 10, 10, 1, p.skin); px(ctx, ox + 14, oy + 10, p.ol);
  px(ctx, ox + 8, oy + 10, p.skinSh); px(ctx, ox + 9, oy + 10, p.skinSh); // mouth

  // Row 11: neck
  px(ctx, ox + 4, oy + 11, p.ol); rect(ctx, ox + 5, oy + 11, 8, 1, p.skinSh); px(ctx, ox + 13, oy + 11, p.ol);

  // Long hair style extension
  if (hairStyle === 1) {
    px(ctx, ox + 0, oy + 8, p.ol); px(ctx, ox + 1, oy + 8, p.hair);
    px(ctx, ox + 16, oy + 8, p.hair); px(ctx, ox + 17, oy + 8, p.ol);
    px(ctx, ox + 0, oy + 9, p.ol); px(ctx, ox + 1, oy + 9, p.hairSh);
    px(ctx, ox + 16, oy + 9, p.hairSh); px(ctx, ox + 17, oy + 9, p.ol);
    px(ctx, ox + 1, oy + 10, p.ol); px(ctx, ox + 16, oy + 10, p.ol);
  } else if (hairStyle === 2) {
    // Ponytail tuft
    rect(ctx, ox + 7, oy - 1, 4, 1, p.ol);
    px(ctx, ox + 7, oy + 0, p.ol); rect(ctx, ox + 8, oy + 0, 2, 1, p.hairHi); px(ctx, ox + 10, oy + 0, p.ol);
  } else if (hairStyle === 3) {
    // Cropped cut: expose more face and reduce side bulk.
    rect(ctx, ox + 1, oy + 6, 2, 2, p.skin);
    rect(ctx, ox + 15, oy + 6, 2, 2, p.skin);
    rect(ctx, ox + 4, oy + 4, 10, 1, p.hairSh);
  }

  // ===== SHIRT =====
  const sy = oy + 12;
  px(ctx, ox + 4, sy, p.ol); rect(ctx, ox + 5, sy, 8, 1, p.shirt); px(ctx, ox + 13, sy, p.ol);
  rect(ctx, ox + 7, sy, 4, 1, p.shirtSh); // collar
  for (let row = 1; row <= 3; row++) {
    px(ctx, ox + 3, sy + row, p.ol); rect(ctx, ox + 4, sy + row, 10, 1, p.shirt); px(ctx, ox + 14, sy + row, p.ol);
  }
  px(ctx, ox + 3, sy + 4, p.ol); rect(ctx, ox + 4, sy + 4, 10, 1, p.shirtSh); px(ctx, ox + 14, sy + 4, p.ol);
  rect(ctx, ox + 5, sy + 1, 4, 1, p.shirtHi); rect(ctx, ox + 6, sy + 2, 2, 1, p.shirtHi);

  // Arms
  const armLY = sy + 1 + armL;
  px(ctx, ox + 1, armLY, p.ol); px(ctx, ox + 2, armLY, p.shirt); px(ctx, ox + 3, armLY, p.ol);
  px(ctx, ox + 1, armLY + 1, p.ol); px(ctx, ox + 2, armLY + 1, p.shirtSh); px(ctx, ox + 3, armLY + 1, p.ol);
  px(ctx, ox + 1, armLY + 2, p.ol); px(ctx, ox + 2, armLY + 2, p.skin); px(ctx, ox + 3, armLY + 2, p.ol);
  px(ctx, ox + 2, armLY + 3, p.ol);

  const armRY = sy + 1 + armR;
  px(ctx, ox + 14, armRY, p.ol); px(ctx, ox + 15, armRY, p.shirt); px(ctx, ox + 16, armRY, p.ol);
  px(ctx, ox + 14, armRY + 1, p.ol); px(ctx, ox + 15, armRY + 1, p.shirtSh); px(ctx, ox + 16, armRY + 1, p.ol);
  px(ctx, ox + 14, armRY + 2, p.ol); px(ctx, ox + 15, armRY + 2, p.skin); px(ctx, ox + 16, armRY + 2, p.ol);
  px(ctx, ox + 15, armRY + 3, p.ol);

  // ===== PANTS =====
  const py = sy + 5;
  px(ctx, ox + 4, py, p.ol); rect(ctx, ox + 5, py, 8, 1, p.pants); px(ctx, ox + 13, py, p.ol);
  px(ctx, ox + 4, py + 1, p.ol); rect(ctx, ox + 5, py + 1, 3, 1, p.pants); px(ctx, ox + 8, py + 1, p.ol);
  px(ctx, ox + 9, py + 1, p.ol); rect(ctx, ox + 10, py + 1, 3, 1, p.pants); px(ctx, ox + 13, py + 1, p.ol);

  // ===== LEGS =====
  const lly = py + 2;
  px(ctx, ox + 4, lly + legL, p.ol); rect(ctx, ox + 5, lly + legL, 2, 1, p.pants); px(ctx, ox + 7, lly + legL, p.ol);
  px(ctx, ox + 4, lly + 1 + legL, p.ol); rect(ctx, ox + 5, lly + 1 + legL, 2, 1, p.shoe); px(ctx, ox + 7, lly + 1 + legL, p.ol);
  rect(ctx, ox + 4, lly + 2 + legL, 4, 1, p.ol);

  px(ctx, ox + 10, lly + legR, p.ol); rect(ctx, ox + 11, lly + legR, 2, 1, p.pants); px(ctx, ox + 13, lly + legR, p.ol);
  px(ctx, ox + 10, lly + 1 + legR, p.ol); rect(ctx, ox + 11, lly + 1 + legR, 2, 1, p.shoe); px(ctx, ox + 13, lly + 1 + legR, p.ol);
  rect(ctx, ox + 10, lly + 2 + legR, 4, 1, p.ol);
}

function drawBack(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  p: Palette,
  hairStyle: number,
  legL: number,
  legR: number,
  armL: number,
  armR: number,
): void {
  // Hair from behind (rounder, fuller)
  rect(ctx, ox + 4, oy, 2, 1, p.ol); rect(ctx, ox + 7, oy, 3, 1, p.ol); rect(ctx, ox + 12, oy, 2, 1, p.ol);
  px(ctx, ox + 3, oy + 1, p.ol); rect(ctx, ox + 4, oy + 1, 10, 1, p.hair); px(ctx, ox + 14, oy + 1, p.ol);
  px(ctx, ox + 2, oy + 2, p.ol); rect(ctx, ox + 3, oy + 2, 12, 1, p.hair); px(ctx, ox + 15, oy + 2, p.ol);
  px(ctx, ox + 1, oy + 3, p.ol); rect(ctx, ox + 2, oy + 3, 14, 1, p.hair); px(ctx, ox + 16, oy + 3, p.ol);
  px(ctx, ox + 0, oy + 4, p.ol); rect(ctx, ox + 1, oy + 4, 16, 1, p.hair); px(ctx, ox + 17, oy + 4, p.ol);
  px(ctx, ox + 0, oy + 5, p.ol); rect(ctx, ox + 1, oy + 5, 16, 1, p.hair); px(ctx, ox + 17, oy + 5, p.ol);
  px(ctx, ox + 0, oy + 6, p.ol); rect(ctx, ox + 1, oy + 6, 16, 1, p.hair); px(ctx, ox + 17, oy + 6, p.ol);
  px(ctx, ox + 0, oy + 7, p.ol); rect(ctx, ox + 1, oy + 7, 16, 1, p.hairSh); px(ctx, ox + 17, oy + 7, p.ol);
  px(ctx, ox + 1, oy + 8, p.ol); rect(ctx, ox + 2, oy + 8, 14, 1, p.hairSh); px(ctx, ox + 16, oy + 8, p.ol);
  px(ctx, ox + 2, oy + 9, p.ol); rect(ctx, ox + 3, oy + 9, 12, 1, p.hairSh); px(ctx, ox + 15, oy + 9, p.ol);

  // Highlights
  rect(ctx, ox + 5, oy + 2, 3, 1, p.hairHi); rect(ctx, ox + 10, oy + 2, 3, 1, p.hairHi);
  rect(ctx, ox + 4, oy + 3, 2, 1, p.hairHi); rect(ctx, ox + 12, oy + 3, 2, 1, p.hairHi);
  rect(ctx, ox + 3, oy + 4, 3, 1, p.hairHi); rect(ctx, ox + 12, oy + 4, 3, 1, p.hairHi);

  // Ponytail from back
  if (hairStyle === 2) {
    rect(ctx, ox + 7, oy - 1, 4, 1, p.ol);
    px(ctx, ox + 7, oy, p.ol); rect(ctx, ox + 8, oy, 2, 1, p.hairHi); px(ctx, ox + 10, oy, p.ol);
    // Ponytail hanging down
    px(ctx, ox + 8, oy + 9, p.hair); px(ctx, ox + 9, oy + 9, p.hair);
    px(ctx, ox + 8, oy + 10, p.hairSh); px(ctx, ox + 9, oy + 10, p.hairSh);
    px(ctx, ox + 8, oy + 11, p.ol); px(ctx, ox + 9, oy + 11, p.ol);
  } else if (hairStyle === 3) {
    // Cropped cut from behind.
    rect(ctx, ox + 1, oy + 8, 16, 1, p.skinSh);
    rect(ctx, ox + 2, oy + 9, 14, 1, p.skinSh);
  }

  // Neck
  px(ctx, ox + 5, oy + 10, p.ol); rect(ctx, ox + 6, oy + 10, 6, 1, p.skinSh); px(ctx, ox + 12, oy + 10, p.ol);
  px(ctx, ox + 4, oy + 11, p.ol); rect(ctx, ox + 5, oy + 11, 8, 1, p.skinSh); px(ctx, ox + 13, oy + 11, p.ol);

  // Shirt
  const sy = oy + 12;
  px(ctx, ox + 4, sy, p.ol); rect(ctx, ox + 5, sy, 8, 1, p.shirt); px(ctx, ox + 13, sy, p.ol);
  for (let row = 1; row <= 3; row++) {
    px(ctx, ox + 3, sy + row, p.ol); rect(ctx, ox + 4, sy + row, 10, 1, p.shirt); px(ctx, ox + 14, sy + row, p.ol);
  }
  px(ctx, ox + 3, sy + 4, p.ol); rect(ctx, ox + 4, sy + 4, 10, 1, p.shirtSh); px(ctx, ox + 14, sy + 4, p.ol);

  // Arms
  const aLY = sy + 1 + armL;
  px(ctx, ox + 1, aLY, p.ol); px(ctx, ox + 2, aLY, p.shirt); px(ctx, ox + 3, aLY, p.ol);
  px(ctx, ox + 1, aLY + 1, p.ol); px(ctx, ox + 2, aLY + 1, p.shirtSh); px(ctx, ox + 3, aLY + 1, p.ol);
  px(ctx, ox + 2, aLY + 2, p.ol);
  const aRY = sy + 1 + armR;
  px(ctx, ox + 14, aRY, p.ol); px(ctx, ox + 15, aRY, p.shirt); px(ctx, ox + 16, aRY, p.ol);
  px(ctx, ox + 14, aRY + 1, p.ol); px(ctx, ox + 15, aRY + 1, p.shirtSh); px(ctx, ox + 16, aRY + 1, p.ol);
  px(ctx, ox + 15, aRY + 2, p.ol);

  // Pants + legs
  const py = sy + 5;
  px(ctx, ox + 4, py, p.ol); rect(ctx, ox + 5, py, 8, 1, p.pants); px(ctx, ox + 13, py, p.ol);
  px(ctx, ox + 4, py + 1, p.ol); rect(ctx, ox + 5, py + 1, 3, 1, p.pants); px(ctx, ox + 8, py + 1, p.ol);
  px(ctx, ox + 9, py + 1, p.ol); rect(ctx, ox + 10, py + 1, 3, 1, p.pants); px(ctx, ox + 13, py + 1, p.ol);

  const lly = py + 2;
  px(ctx, ox + 4, lly + legL, p.ol); rect(ctx, ox + 5, lly + legL, 2, 1, p.pants); px(ctx, ox + 7, lly + legL, p.ol);
  px(ctx, ox + 4, lly + 1 + legL, p.ol); rect(ctx, ox + 5, lly + 1 + legL, 2, 1, p.shoe); px(ctx, ox + 7, lly + 1 + legL, p.ol);
  rect(ctx, ox + 4, lly + 2 + legL, 4, 1, p.ol);

  px(ctx, ox + 10, lly + legR, p.ol); rect(ctx, ox + 11, lly + legR, 2, 1, p.pants); px(ctx, ox + 13, lly + legR, p.ol);
  px(ctx, ox + 10, lly + 1 + legR, p.ol); rect(ctx, ox + 11, lly + 1 + legR, 2, 1, p.shoe); px(ctx, ox + 13, lly + 1 + legR, p.ol);
  rect(ctx, ox + 10, lly + 2 + legR, 4, 1, p.ol);
}

function drawSideRight(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  p: Palette,
  hairStyle: number,
  legL: number,
  legR: number,
  armSwing: number,
): void {
  // Hair (extends back-right)
  rect(ctx, ox + 5, oy, 3, 1, p.ol); rect(ctx, ox + 9, oy, 2, 1, p.ol);
  px(ctx, ox + 4, oy + 1, p.ol); rect(ctx, ox + 5, oy + 1, 4, 1, p.hair); px(ctx, ox + 9, oy + 1, p.ol);
  rect(ctx, ox + 10, oy + 1, 3, 1, p.hair); px(ctx, ox + 13, oy + 1, p.ol);
  px(ctx, ox + 3, oy + 2, p.ol); rect(ctx, ox + 4, oy + 2, 11, 1, p.hair); px(ctx, ox + 15, oy + 2, p.ol);
  px(ctx, ox + 2, oy + 3, p.ol); rect(ctx, ox + 3, oy + 3, 13, 1, p.hair); px(ctx, ox + 16, oy + 3, p.ol);
  px(ctx, ox + 1, oy + 4, p.ol); rect(ctx, ox + 2, oy + 4, 15, 1, p.hair); px(ctx, ox + 17, oy + 4, p.ol);

  rect(ctx, ox + 5, oy + 2, 3, 1, p.hairHi); rect(ctx, ox + 11, oy + 2, 2, 1, p.hairHi);
  rect(ctx, ox + 4, oy + 3, 3, 1, p.hairHi); rect(ctx, ox + 13, oy + 3, 2, 1, p.hairHi);

  if (hairStyle === 3) {
    rect(ctx, ox + 13, oy + 6, 4, 2, p.skinSh);
    rect(ctx, ox + 3, oy + 5, 2, 2, p.skin);
  }

  // Face + hair sides
  px(ctx, ox + 1, oy + 5, p.ol); rect(ctx, ox + 2, oy + 5, 2, 1, p.hair); px(ctx, ox + 4, oy + 5, p.ol);
  rect(ctx, ox + 5, oy + 5, 7, 1, p.skin); px(ctx, ox + 12, oy + 5, p.ol);
  rect(ctx, ox + 13, oy + 5, 4, 1, p.hair); px(ctx, ox + 17, oy + 5, p.ol);
  rect(ctx, ox + 5, oy + 5, 3, 1, p.hair); // bangs

  px(ctx, ox + 1, oy + 6, p.ol); px(ctx, ox + 2, oy + 6, p.hairSh); px(ctx, ox + 3, oy + 6, p.ol);
  rect(ctx, ox + 4, oy + 6, 8, 1, p.skin); px(ctx, ox + 12, oy + 6, p.ol);
  rect(ctx, ox + 13, oy + 6, 4, 1, p.hairSh); px(ctx, ox + 17, oy + 6, p.ol);

  px(ctx, ox + 2, oy + 7, p.ol); px(ctx, ox + 3, oy + 7, p.ol);
  rect(ctx, ox + 4, oy + 7, 8, 1, p.skin); px(ctx, ox + 12, oy + 7, p.ol);
  rect(ctx, ox + 13, oy + 7, 3, 1, p.hairSh); px(ctx, ox + 16, oy + 7, p.ol);

  // Eye
  rect(ctx, ox + 6, oy + 7, 2, 2, p.eye);
  px(ctx, ox + 6, oy + 7, '#ffffff');

  // Lower face
  px(ctx, ox + 3, oy + 8, p.ol); rect(ctx, ox + 4, oy + 8, 8, 1, p.skin); px(ctx, ox + 12, oy + 8, p.ol);
  rect(ctx, ox + 13, oy + 8, 2, 1, p.hairSh); px(ctx, ox + 15, oy + 8, p.ol);
  px(ctx, ox + 5, oy + 8, p.skinSh); // nose

  px(ctx, ox + 4, oy + 9, p.ol); rect(ctx, ox + 5, oy + 9, 6, 1, p.skin); px(ctx, ox + 11, oy + 9, p.ol); px(ctx, ox + 12, oy + 9, p.ol);
  px(ctx, ox + 5, oy + 10, p.ol); rect(ctx, ox + 6, oy + 10, 4, 1, p.skinSh); px(ctx, ox + 10, oy + 10, p.ol);

  // Shirt
  const sy = oy + 11;
  px(ctx, ox + 5, sy, p.ol); rect(ctx, ox + 6, sy, 5, 1, p.shirt); px(ctx, ox + 11, sy, p.ol);
  for (let row = 1; row <= 3; row++) {
    px(ctx, ox + 4, sy + row, p.ol); rect(ctx, ox + 5, sy + row, 7, 1, p.shirt); px(ctx, ox + 12, sy + row, p.ol);
  }
  px(ctx, ox + 4, sy + 4, p.ol); rect(ctx, ox + 5, sy + 4, 7, 1, p.shirtSh); px(ctx, ox + 12, sy + 4, p.ol);
  rect(ctx, ox + 6, sy + 1, 3, 1, p.shirtHi);

  // Arm
  const armY = sy + 2 + armSwing;
  px(ctx, ox + 3, armY, p.ol); px(ctx, ox + 4, armY, p.shirt);
  px(ctx, ox + 2, armY + 1, p.ol); px(ctx, ox + 3, armY + 1, p.shirtSh); px(ctx, ox + 4, armY + 1, p.ol);
  px(ctx, ox + 2, armY + 2, p.ol); px(ctx, ox + 3, armY + 2, p.skin);
  px(ctx, ox + 3, armY + 3, p.ol);

  // Pants
  const py = sy + 5;
  px(ctx, ox + 5, py, p.ol); rect(ctx, ox + 6, py, 5, 1, p.pants); px(ctx, ox + 11, py, p.ol);

  const lly = py + 1;
  px(ctx, ox + 5, lly + legL, p.ol); rect(ctx, ox + 6, lly + legL, 2, 1, p.pants); px(ctx, ox + 8, lly + legL, p.ol);
  px(ctx, ox + 5, lly + 1 + legL, p.ol); rect(ctx, ox + 6, lly + 1 + legL, 2, 1, p.shoe); px(ctx, ox + 8, lly + 1 + legL, p.ol);
  rect(ctx, ox + 5, lly + 2 + legL, 4, 1, p.ol);

  px(ctx, ox + 8, lly + legR, p.ol); rect(ctx, ox + 9, lly + legR, 2, 1, p.pants); px(ctx, ox + 11, lly + legR, p.ol);
  px(ctx, ox + 8, lly + 1 + legR, p.ol); rect(ctx, ox + 9, lly + 1 + legR, 2, 1, p.shoe); px(ctx, ox + 11, lly + 1 + legR, p.ol);
  rect(ctx, ox + 8, lly + 2 + legR, 4, 1, p.ol);
}

function drawSideLeft(
  ctx: CanvasRenderingContext2D,
  ox: number,
  oy: number,
  p: Palette,
  hairStyle: number,
  legL: number,
  legR: number,
  armSwing: number,
): void {
  // Mirror: draw right-facing to temp canvas, flip
  const tmp = document.createElement('canvas');
  tmp.width = FRAME_WIDTH;
  tmp.height = FRAME_HEIGHT;
  const tc = tmp.getContext('2d');
  if (!tc) return;
  tc.imageSmoothingEnabled = false;
  drawSideRight(tc, ox, oy, p, hairStyle, legR, legL, armSwing);
  ctx.save();
  ctx.translate(FRAME_WIDTH, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(tmp, 0, 0);
  ctx.restore();
}

function applyStyleOverlay(
  ctx: CanvasRenderingContext2D,
  dir: number,
  ox: number,
  oy: number,
  p: Palette,
  outfitType: number,
  gender: Gender,
): void {
  const outfit = outfitType % 6;

  if (dir === DIR_FRONT || dir === DIR_BACK) {
    const sy = oy + 12;

    if (outfit === 1) {
      px(ctx, ox + 8, sy + 1, p.shirtHi);
      px(ctx, ox + 9, sy + 1, p.shirtHi);
      px(ctx, ox + 8, sy + 2, p.ol);
      px(ctx, ox + 9, sy + 2, p.ol);
    } else if (outfit === 2) {
      rect(ctx, ox + 6, sy + 1, 1, 4, p.pantsSh);
      rect(ctx, ox + 10, sy + 1, 1, 4, p.pantsSh);
      rect(ctx, ox + 7, sy + 3, 3, 1, p.pantsSh);
    } else if (outfit === 3) {
      rect(ctx, ox + 5, sy + 1, 8, 1, p.shirtHi);
      rect(ctx, ox + 5, sy + 3, 8, 1, p.shirtHi);
    } else if (outfit === 4) {
      rect(ctx, ox + 6, sy + 1, 1, 3, p.shirtSh);
      rect(ctx, ox + 9, sy + 1, 1, 3, p.shirtSh);
      rect(ctx, ox + 5, sy + 2, 8, 1, p.shirtSh);
    } else if (outfit === 5) {
      rect(ctx, ox + 4, sy + 5, 10, 1, p.shirt);
      rect(ctx, ox + 4, sy + 6, 10, 1, p.shirtSh);
    }

    if (gender === 'male') {
      px(ctx, ox + 4, sy, p.shirtSh);
      px(ctx, ox + 13, sy, p.shirtSh);
    } else if (gender === 'female') {
      px(ctx, ox + 7, sy + 5, p.shirtHi);
      px(ctx, ox + 8, sy + 5, p.shirtHi);
      px(ctx, ox + 9, sy + 5, p.shirtHi);
    } else {
      px(ctx, ox + 8, sy + 2, p.shirtHi);
    }
    return;
  }

  const sy = oy + 11;
  if (outfit === 2) {
    rect(ctx, ox + 7, sy + 1, 1, 3, p.pantsSh);
  } else if (outfit === 5) {
    rect(ctx, ox + 5, sy + 5, 6, 1, p.shirtSh);
  }

  if (gender === 'female') {
    px(ctx, ox + 8, sy + 1, p.shirtHi);
  } else if (gender === 'male') {
    px(ctx, ox + 5, sy, p.shirtSh);
  }
}

function drawFrame(
  ctx: CanvasRenderingContext2D,
  frame: number,
  pal: Palette,
  hairStyle: number,
  outfitType: number,
  gender: Gender,
): void {
  // Frame layout: 0-3 front, 4-7 front walk, 8-11 right, 12-15 left, 16-19 back
  let dir: number;
  let walkFrame: number;
  if (frame < 4) {
    dir = DIR_FRONT; walkFrame = frame;
  } else if (frame < 8) {
    dir = DIR_FRONT; walkFrame = frame - 4;
  } else if (frame < 12) {
    dir = DIR_RIGHT; walkFrame = frame - 8;
  } else if (frame < 16) {
    dir = DIR_LEFT; walkFrame = frame - 12;
  } else {
    dir = DIR_BACK; walkFrame = frame - 16;
  }

  const isWalking = walkFrame > 0;
  let legL = 0;
  let legR = 0;
  let bodyBob = 0;
  let armL = 0;
  let armR = 0;

  if (isWalking) {
    if (walkFrame === 1) { legL = -1; legR = 1; bodyBob = -1; armL = 1; armR = -1; }
    else if (walkFrame === 3) { legL = 1; legR = -1; bodyBob = -1; armL = -1; armR = 1; }
  }

  const ox = 7;
  const oy = 2 + bodyBob;

  if (dir === DIR_FRONT) {
    drawFront(ctx, ox, oy, pal, hairStyle, legL, legR, armL, armR);
  } else if (dir === DIR_BACK) {
    drawBack(ctx, ox, oy, pal, hairStyle, legL, legR, armL, armR);
  } else if (dir === DIR_RIGHT) {
    drawSideRight(ctx, ox, oy, pal, hairStyle, legL, legR, armL);
  } else {
    drawSideLeft(ctx, ox, oy, pal, hairStyle, legL, legR, armL);
  }

  applyStyleOverlay(ctx, dir, ox, oy, pal, outfitType, gender);
}

export function generatePlayerSprite(
  scene: Phaser.Scene,
  config: PlayerSpriteConfig,
  key = 'player_sheet',
): void {
  if (scene.textures.exists(key)) {
    scene.textures.remove(key);
  }

  const canvas = document.createElement('canvas');
  canvas.width = FRAME_WIDTH * FRAME_COUNT;
  canvas.height = FRAME_HEIGHT;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context unavailable while generating player sprites');
  }

  ctx.imageSmoothingEnabled = false;

  const pal = buildPalette(
    SKIN_TONES[config.skinTone % SKIN_TONES.length],
    HAIR_COLORS[config.hairColor % HAIR_COLORS.length],
    EYE_COLORS[config.eyeColor % EYE_COLORS.length],
    OUTFIT_COLORS[config.outfitColor % OUTFIT_COLORS.length],
    config.outfitType,
    config.gender,
  );

  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = FRAME_WIDTH;
    frameCanvas.height = FRAME_HEIGHT;
    const frameCtx = frameCanvas.getContext('2d');

    if (!frameCtx) {
      continue;
    }

    frameCtx.imageSmoothingEnabled = false;
    drawFrame(frameCtx, frame, pal, config.hairStyle % 4, config.outfitType, config.gender);
    ctx.drawImage(frameCanvas, frame * FRAME_WIDTH, 0);
  }

  scene.textures.addSpriteSheet(key, canvas as unknown as HTMLImageElement, {
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
  });
}
