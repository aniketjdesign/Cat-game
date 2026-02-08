import Phaser from 'phaser';
import { CAT_BREEDS, type CatBreedId } from '../constants';

const FRAME_WIDTH = 32;
const FRAME_HEIGHT = 32;
const FRAME_COUNT = 62;

interface BreedVisual {
  pattern:
    | 'tabby'
    | 'tuxedo'
    | 'calico'
    | 'points'
    | 'bengal'
    | 'solid'
    | 'black'
    | 'russian_blue'
    | 'ginger_white';
  baseTint: number;
  patchMix: number;
}

const BREED_VISUALS: Record<CatBreedId, BreedVisual> = {
  orange_tabby: { pattern: 'tabby', baseTint: 0.78, patchMix: 0.08 },
  grey_tabby: { pattern: 'tabby', baseTint: 0.66, patchMix: 0.1 },
  tuxedo: { pattern: 'tuxedo', baseTint: 0.95, patchMix: 0 },
  calico: { pattern: 'calico', baseTint: 0.16, patchMix: 0.55 },
  siamese: { pattern: 'points', baseTint: 0.12, patchMix: 0.45 },
  persian: { pattern: 'solid', baseTint: 0.2, patchMix: 0.2 },
  bengal: { pattern: 'bengal', baseTint: 0.62, patchMix: 0.24 },
  black: { pattern: 'black', baseTint: 0.98, patchMix: 0.1 },
  russian_blue: { pattern: 'russian_blue', baseTint: 0.78, patchMix: 0.15 },
  ginger_white: { pattern: 'ginger_white', baseTint: 0.06, patchMix: 0.85 },
};

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const normalized =
    clean.length === 3
      ? clean
          .split('')
          .map((char) => char + char)
          .join('')
      : clean;
  const value = Number.parseInt(normalized, 16);
  return {
    r: (value >> 16) & 0xff,
    g: (value >> 8) & 0xff,
    b: value & 0xff,
  };
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

function drawBreedPattern(
  ctx: CanvasRenderingContext2D,
  breedId: CatBreedId,
  frame: number,
  ox: number,
  oy: number,
  by: number,
  colors: {
    stripe: string;
    patch: string;
    patchDark: string;
    white: string;
  },
): void {
  const tailWag = Math.floor(frame / 3) % 3;
  const tx = ox + 12 + [-1, 0, 1][tailWag];
  const ty = by + 1;
  const visual = BREED_VISUALS[breedId];

  if (visual.pattern === 'tabby') {
    rect(ctx, ox + 4, oy + 5, 2, 1, colors.stripe);
    rect(ctx, ox + 9, oy + 5, 2, 1, colors.stripe);
    rect(ctx, ox + 7, oy + 4, 1, 2, colors.stripe);
    rect(ctx, ox + 4, by + 1, 2, 1, colors.stripe);
    rect(ctx, ox + 9, by + 1, 2, 1, colors.stripe);
    rect(ctx, ox + 5, by + 3, 1, 2, colors.stripe);
    rect(ctx, ox + 9, by + 3, 1, 2, colors.stripe);
    rect(ctx, tx + 2, ty, 2, 1, colors.stripe);
    rect(ctx, tx + 1, ty + 1, 2, 1, colors.stripe);
    return;
  }

  if (visual.pattern === 'tuxedo') {
    rect(ctx, ox + 6, oy + 9, 3, 3, colors.white);
    rect(ctx, ox + 6, by + 1, 3, 4, colors.white);
    rect(ctx, ox + 4, by + 8, 2, 1, colors.white);
    rect(ctx, ox + 9, by + 8, 2, 1, colors.white);
    return;
  }

  if (visual.pattern === 'calico') {
    rect(ctx, ox + 3, oy + 5, 2, 2, colors.patch);
    rect(ctx, ox + 10, oy + 6, 2, 2, colors.patchDark);
    rect(ctx, ox + 4, by + 1, 2, 2, colors.patch);
    rect(ctx, ox + 9, by + 2, 2, 2, colors.patchDark);
    rect(ctx, tx + 2, ty, 1, 2, colors.patch);
    return;
  }

  if (visual.pattern === 'points') {
    rect(ctx, ox + 1, oy + 1, 3, 3, colors.patchDark);
    rect(ctx, ox + 11, oy + 1, 3, 3, colors.patchDark);
    rect(ctx, ox + 5, oy + 7, 5, 2, colors.patchDark);
    rect(ctx, tx + 1, ty - 1, 3, 4, colors.patchDark);
    rect(ctx, ox + 4, by + 8, 2, 1, colors.patchDark);
    rect(ctx, ox + 9, by + 8, 2, 1, colors.patchDark);
    return;
  }

  if (visual.pattern === 'bengal') {
    rect(ctx, ox + 4, oy + 6, 1, 1, colors.patchDark);
    rect(ctx, ox + 10, oy + 7, 1, 1, colors.patchDark);
    rect(ctx, ox + 5, by + 1, 1, 1, colors.patchDark);
    rect(ctx, ox + 9, by + 2, 1, 1, colors.patchDark);
    rect(ctx, ox + 6, by + 3, 2, 1, colors.patchDark);
    rect(ctx, ox + 8, by + 4, 1, 1, colors.patchDark);
    rect(ctx, tx + 2, ty, 1, 1, colors.patchDark);
    rect(ctx, tx + 2, ty + 2, 1, 1, colors.patchDark);
    return;
  }

  if (visual.pattern === 'black') {
    rect(ctx, ox + 4, oy + 5, 2, 1, colors.patch);
    rect(ctx, ox + 9, oy + 5, 2, 1, colors.patch);
    rect(ctx, ox + 5, by + 1, 4, 1, colors.patch);
    return;
  }

  if (visual.pattern === 'russian_blue') {
    rect(ctx, ox + 5, oy + 5, 4, 1, colors.stripe);
    rect(ctx, ox + 5, by + 2, 4, 1, colors.stripe);
    rect(ctx, tx + 2, ty, 1, 1, colors.stripe);
    return;
  }

  if (visual.pattern === 'ginger_white') {
    rect(ctx, ox + 4, oy + 4, 5, 2, colors.patch);
    rect(ctx, ox + 4, by + 1, 2, 2, colors.patch);
    rect(ctx, ox + 9, by + 2, 2, 2, colors.patch);
    rect(ctx, tx + 1, ty - 1, 2, 4, colors.patch);
    return;
  }
}

function drawCatFrame(
  ctx: CanvasRenderingContext2D,
  frame: number,
  breedId: CatBreedId,
  primary: string,
  secondary: string,
  eyeColor: string,
): void {
  const visual = BREED_VISUALS[breedId];

  const OL = '#5c3a1e';

  let base = mixColors('#f5e8d0', primary, visual.baseTint);
  if (visual.pattern === 'tuxedo') {
    base = mixColors(primary, '#000000', 0.06);
  }
  if (visual.pattern === 'calico') {
    base = '#f5e8d0';
  }

  const BASE = base;
  const BASE_HI = mixColors(BASE, '#ffffff', 0.17);
  const BASE_SH = mixColors(BASE, '#000000', 0.15);
  const PATCH = visual.pattern === 'tuxedo' ? secondary : mixColors(primary, secondary, visual.patchMix);
  const PATCH_DK = mixColors(PATCH, '#000000', 0.25);
  const PATCH_LT = mixColors(PATCH, '#ffffff', 0.2);
  const EAR_IN = mixColors(PATCH, '#ffffff', 0.35);
  const NOSE = '#c46b6b';
  const EYE = mixColors(eyeColor, '#000000', 0.7);
  const MOUTH = '#8b6040';
  const STRIPE = mixColors(secondary, '#000000', 0.12);

  const bob = frame % 16 < 8 ? 0 : 1;
  const isBlink = frame % 20 >= 18;
  const isHappy = frame >= 48 && frame <= 51;
  const isSleep = frame >= 18 && frame <= 21;
  const walkPhase = frame >= 4 && frame <= 15 ? frame % 4 : -1;

  const ox = 8;
  const oy = 3 + bob;

  px(ctx, ox + 2, oy + 0, OL);
  px(ctx, ox + 1, oy + 1, OL); px(ctx, ox + 2, oy + 1, PATCH); px(ctx, ox + 3, oy + 1, OL);
  px(ctx, ox + 0, oy + 2, OL); px(ctx, ox + 1, oy + 2, PATCH); px(ctx, ox + 2, oy + 2, EAR_IN); px(ctx, ox + 3, oy + 2, PATCH); px(ctx, ox + 4, oy + 2, OL);
  px(ctx, ox + 0, oy + 3, OL); px(ctx, ox + 1, oy + 3, PATCH_LT); px(ctx, ox + 2, oy + 3, EAR_IN); px(ctx, ox + 3, oy + 3, PATCH); px(ctx, ox + 4, oy + 3, OL);

  px(ctx, ox + 12, oy + 0, OL);
  px(ctx, ox + 11, oy + 1, OL); px(ctx, ox + 12, oy + 1, PATCH); px(ctx, ox + 13, oy + 1, OL);
  px(ctx, ox + 10, oy + 2, OL); px(ctx, ox + 11, oy + 2, PATCH); px(ctx, ox + 12, oy + 2, EAR_IN); px(ctx, ox + 13, oy + 2, PATCH); px(ctx, ox + 14, oy + 2, OL);
  px(ctx, ox + 10, oy + 3, OL); px(ctx, ox + 11, oy + 3, PATCH); px(ctx, ox + 12, oy + 3, EAR_IN); px(ctx, ox + 13, oy + 3, PATCH_LT); px(ctx, ox + 14, oy + 3, OL);

  rect(ctx, ox + 1, oy + 4, 1, 1, OL); rect(ctx, ox + 2, oy + 4, 11, 1, BASE_HI); rect(ctx, ox + 13, oy + 4, 1, 1, OL);

  rect(ctx, ox + 4, oy + 4, 7, 1, PATCH_LT);
  rect(ctx, ox + 5, oy + 5, 5, 1, PATCH_LT);

  for (let row = 5; row <= 11; row += 1) {
    const inset = row >= 10 ? 1 : 0;
    px(ctx, ox + inset, oy + row, OL);
    rect(ctx, ox + 1 + inset, oy + row, 13 - inset * 2, 1, BASE);
    px(ctx, ox + 14 - inset, oy + row, OL);
  }

  rect(ctx, ox + 1, oy + 5, 13, 1, BASE_HI);
  rect(ctx, ox + 1, oy + 6, 13, 1, BASE_HI);
  rect(ctx, ox + 2, oy + 7, 11, 1, mixColors(BASE_HI, BASE, 0.5));

  px(ctx, ox + 2, oy + 12, OL); rect(ctx, ox + 3, oy + 12, 9, 1, BASE); px(ctx, ox + 12, oy + 12, OL);

  if (isSleep) {
    rect(ctx, ox + 3, oy + 8, 2, 1, EYE);
    rect(ctx, ox + 10, oy + 8, 2, 1, EYE);
    px(ctx, ox + 7, oy + 9, NOSE);
  } else if (isBlink) {
    rect(ctx, ox + 3, oy + 8, 2, 1, EYE);
    rect(ctx, ox + 10, oy + 8, 2, 1, EYE);
    px(ctx, ox + 7, oy + 9, NOSE);
    px(ctx, ox + 6, oy + 10, MOUTH); px(ctx, ox + 8, oy + 10, MOUTH);
  } else if (isHappy) {
    px(ctx, ox + 3, oy + 9, EYE); px(ctx, ox + 4, oy + 8, EYE); px(ctx, ox + 5, oy + 9, EYE);
    px(ctx, ox + 9, oy + 9, EYE); px(ctx, ox + 10, oy + 8, EYE); px(ctx, ox + 11, oy + 9, EYE);
    px(ctx, ox + 7, oy + 9, NOSE);
    px(ctx, ox + 6, oy + 10, MOUTH); px(ctx, ox + 7, oy + 11, MOUTH); px(ctx, ox + 8, oy + 10, MOUTH);
  } else {
    rect(ctx, ox + 3, oy + 8, 2, 2, EYE);
    rect(ctx, ox + 10, oy + 8, 2, 2, EYE);
    px(ctx, ox + 3, oy + 8, '#ffffff');
    px(ctx, ox + 10, oy + 8, '#ffffff');
    px(ctx, ox + 7, oy + 9, NOSE);
    px(ctx, ox + 6, oy + 10, MOUTH);
    px(ctx, ox + 8, oy + 10, MOUTH);
    px(ctx, ox + 7, oy + 11, MOUTH);
  }

  const by = oy + 13;

  px(ctx, ox + 3, by + 0, OL); rect(ctx, ox + 4, by + 0, 7, 1, BASE); px(ctx, ox + 11, by + 0, OL);

  for (let row = 1; row <= 4; row += 1) {
    px(ctx, ox + 2, by + row, OL);
    rect(ctx, ox + 3, by + row, 9, 1, BASE);
    px(ctx, ox + 12, by + row, OL);
  }

  px(ctx, ox + 3, by + 5, OL); rect(ctx, ox + 4, by + 5, 7, 1, BASE); px(ctx, ox + 11, by + 5, OL);

  rect(ctx, ox + 5, by + 0, 5, 1, PATCH_LT);
  rect(ctx, ox + 4, by + 1, 2, 1, PATCH); rect(ctx, ox + 9, by + 1, 2, 1, PATCH);
  px(ctx, ox + 5, by + 2, PATCH_LT); px(ctx, ox + 9, by + 2, PATCH_LT);
  rect(ctx, ox + 7, by + 1, 1, 3, PATCH_LT);

  rect(ctx, ox + 4, by + 4, 7, 1, BASE_SH);

  const tw = [-1, 0, 1][Math.floor(frame / 3) % 3];
  const tx = ox + 12 + tw;
  const ty = by + 1;

  px(ctx, tx + 0, ty + 2, OL); px(ctx, tx + 1, ty + 2, PATCH); px(ctx, tx + 2, ty + 2, OL);
  px(ctx, tx + 1, ty + 1, OL); px(ctx, tx + 2, ty + 1, PATCH); px(ctx, tx + 3, ty + 1, OL);
  px(ctx, tx + 2, ty + 0, OL); px(ctx, tx + 3, ty + 0, PATCH_DK); px(ctx, tx + 4, ty + 0, OL);
  px(ctx, tx + 2, ty - 1, OL); px(ctx, tx + 3, ty - 1, PATCH); px(ctx, tx + 4, ty - 1, OL);
  px(ctx, tx + 3, ty - 2, OL); px(ctx, tx + 4, ty - 2, OL);

  const ly = by + 6;
  const lsL = walkPhase >= 0 ? (walkPhase < 2 ? 0 : 1) : 0;
  const lsR = walkPhase >= 0 ? (walkPhase < 2 ? 1 : 0) : 0;

  px(ctx, ox + 3, ly + lsL, OL); rect(ctx, ox + 4, ly + lsL, 2, 1, BASE); px(ctx, ox + 6, ly + lsL, OL);
  px(ctx, ox + 3, ly + 1 + lsL, OL); rect(ctx, ox + 4, ly + 1 + lsL, 2, 1, BASE); px(ctx, ox + 6, ly + 1 + lsL, OL);
  rect(ctx, ox + 3, ly + 2 + lsL, 4, 1, OL);

  px(ctx, ox + 8, ly + lsR, OL); rect(ctx, ox + 9, ly + lsR, 2, 1, BASE); px(ctx, ox + 11, ly + lsR, OL);
  px(ctx, ox + 8, ly + 1 + lsR, OL); rect(ctx, ox + 9, ly + 1 + lsR, 2, 1, BASE); px(ctx, ox + 11, ly + 1 + lsR, OL);
  rect(ctx, ox + 8, ly + 2 + lsR, 4, 1, OL);

  drawBreedPattern(ctx, breedId, frame, ox, oy, by, {
    stripe: STRIPE,
    patch: PATCH,
    patchDark: PATCH_DK,
    white: '#f7f2e8',
  });

  if (isSleep) {
    px(ctx, ox + 15, oy + 5, '#9ab1ef');
    px(ctx, ox + 16, oy + 4, '#9ab1ef');
    px(ctx, ox + 17, oy + 5, '#9ab1ef');
    px(ctx, ox + 17, oy + 3, '#7b9ae0');
    px(ctx, ox + 18, oy + 2, '#7b9ae0');
    px(ctx, ox + 19, oy + 3, '#7b9ae0');
  }

  if (isHappy) {
    const hc = frame % 2 === 0 ? '#ff6fa5' : '#ff8fb8';
    px(ctx, ox + 15, oy + 5, hc); px(ctx, ox + 17, oy + 5, hc);
    rect(ctx, ox + 15, oy + 6, 3, 1, hc);
    px(ctx, ox + 16, oy + 7, hc);
  }
}

function generateBreedSheet(
  scene: Phaser.Scene,
  key: string,
  breedId: CatBreedId,
  primary: string,
  secondary: string,
  eye: string,
): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = FRAME_WIDTH * FRAME_COUNT;
  canvas.height = FRAME_HEIGHT;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context unavailable while generating cat sprites');
  }

  ctx.imageSmoothingEnabled = false;

  for (let frame = 0; frame < FRAME_COUNT; frame += 1) {
    const frameCanvas = document.createElement('canvas');
    frameCanvas.width = FRAME_WIDTH;
    frameCanvas.height = FRAME_HEIGHT;
    const frameCtx = frameCanvas.getContext('2d');

    if (!frameCtx) {
      continue;
    }

    frameCtx.imageSmoothingEnabled = false;
    drawCatFrame(frameCtx, frame, breedId, primary, secondary, eye);
    ctx.drawImage(frameCanvas, frame * FRAME_WIDTH, 0);
  }

  scene.textures.addSpriteSheet(key, canvas as unknown as HTMLImageElement, {
    frameWidth: FRAME_WIDTH,
    frameHeight: FRAME_HEIGHT,
  });
}

export function generateCatSprites(scene: Phaser.Scene): void {
  for (const breed of CAT_BREEDS) {
    const key = `cat_${breed.id}`;
    generateBreedSheet(scene, key, breed.id, breed.primary, breed.secondary, breed.eye);
  }
}
