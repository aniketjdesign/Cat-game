import Phaser from 'phaser';

const TILE_SIZE = 32;
const TILESET_COLS = 8;
const TILE_COUNT = 16;

/* ── tiny helpers (match CatSprite / PlayerSprite style) ──────────── */

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

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '');
  const n = clean.length === 3
    ? clean.split('').map((ch) => ch + ch).join('')
    : clean;
  const v = Number.parseInt(n, 16);
  return { r: (v >> 16) & 0xff, g: (v >> 8) & 0xff, b: v & 0xff };
}

function rgbToHex(r: number, g: number, b: number): string {
  const cl = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const h = (v: number) => cl(v).toString(16).padStart(2, '0');
  return `#${h(r)}${h(g)}${h(b)}`;
}

function mix(a: string, b: string, t: number): string {
  const c1 = hexToRgb(a);
  const c2 = hexToRgb(b);
  const u = Math.max(0, Math.min(1, t));
  return rgbToHex(c1.r + (c2.r - c1.r) * u, c1.g + (c2.g - c1.g) * u, c1.b + (c2.b - c1.b) * u);
}

/* ── tile drawing ─────────────────────────────────────────────────── */

function drawWoodFloor(ctx: CanvasRenderingContext2D, x: number, y: number, variant: number): void {
  const base = variant === 0 ? '#C49A5A' : '#B8884E';
  const plankHi = variant === 0 ? '#D4AA6A' : '#C89860';
  const plankSh = variant === 0 ? '#A07838' : '#946C34';
  const grain = variant === 0 ? '#B08840' : '#A47C3C';
  const gap = '#6B4E28';

  rect(ctx, x, y, 32, 32, base);

  // Horizontal planks with highlights and shadow edges
  for (let row = 0; row < 4; row++) {
    const ry = y + row * 8;
    // plank highlight strip at top
    rect(ctx, x, ry, 32, 1, plankHi);
    // plank body
    rect(ctx, x, ry + 1, 32, 5, base);
    // shadow at bottom of plank
    rect(ctx, x, ry + 6, 32, 1, plankSh);
    // gap line
    rect(ctx, x, ry + 7, 32, 1, gap);

    // wood grain details (small horizontal dashes)
    const grainOffset = (row * 7 + variant * 3) % 6;
    for (let gx = grainOffset; gx < 32; gx += 8) {
      rect(ctx, x + gx, ry + 3, 3, 1, grain);
    }
    // stagger a second grain row
    for (let gx = (grainOffset + 4) % 8; gx < 32; gx += 10) {
      rect(ctx, x + gx, ry + 5, 2, 1, grain);
    }

    // vertical plank joints (staggered per row)
    const jointX = row % 2 === 0 ? 15 : 23;
    rect(ctx, x + jointX, ry, 1, 7, plankSh);
    px(ctx, x + jointX, ry, gap);
  }

  // knot detail
  if (variant === 0) {
    px(ctx, x + 8, y + 12, '#8B6330');
    px(ctx, x + 9, y + 12, '#8B6330');
    px(ctx, x + 8, y + 13, '#8B6330');
  } else {
    px(ctx, x + 22, y + 4, '#8B6330');
    px(ctx, x + 23, y + 4, '#8B6330');
  }
}

function drawWallPanel(ctx: CanvasRenderingContext2D, x: number, y: number, variant: number): void {
  // Cream / off-white wall with subtle texture and wainscoting
  const base = variant % 2 === 0 ? '#F2EDE4' : '#EAE5DC';
  const hi = '#FAF8F4';
  const sh = '#D8D0C4';
  const molding = '#C8BEA8';
  const moldingHi = '#E0D8C8';

  rect(ctx, x, y, 32, 32, base);

  // subtle horizontal texture lines
  for (let row = 3; row < 28; row += 5) {
    rect(ctx, x + 1, y + row, 30, 1, mix(base, sh, 0.3));
  }

  // top highlight (light from above)
  rect(ctx, x, y, 32, 2, hi);

  // wall panel inset shadow
  if (variant <= 3) {
    rect(ctx, x + 4, y + 6, 24, 1, sh);
    rect(ctx, x + 3, y + 7, 1, 16, sh);
    rect(ctx, x + 4, y + 7, 24, 15, mix(base, hi, 0.4));
    rect(ctx, x + 28, y + 7, 1, 16, sh);
    rect(ctx, x + 4, y + 22, 24, 1, moldingHi);
  }

  // bottom wainscoting / baseboard
  rect(ctx, x, y + 26, 32, 1, moldingHi);
  rect(ctx, x, y + 27, 32, 4, molding);
  rect(ctx, x, y + 31, 32, 1, mix(molding, '#000000', 0.2));

  // baseboard groove
  rect(ctx, x, y + 29, 32, 1, mix(molding, '#000000', 0.1));
}

function drawPurpleWall(ctx: CanvasRenderingContext2D, x: number, y: number, variant: number): void {
  const base = '#7B4B94';
  const hi = '#9B6BB4';
  const sh = '#5E3874';
  const pattern = '#8A5AA4';

  rect(ctx, x, y, 32, 32, base);

  // diamond / argyle wallpaper pattern
  for (let dy = 0; dy < 32; dy += 8) {
    for (let dx = 0; dx < 32; dx += 8) {
      const cx = dx + 4;
      const cy = dy + 4;
      // small diamond shape
      px(ctx, x + cx, y + cy - 2, pattern);
      px(ctx, x + cx - 1, y + cy - 1, pattern);
      px(ctx, x + cx + 1, y + cy - 1, pattern);
      px(ctx, x + cx - 2, y + cy, pattern);
      px(ctx, x + cx + 2, y + cy, pattern);
      px(ctx, x + cx - 1, y + cy + 1, pattern);
      px(ctx, x + cx + 1, y + cy + 1, pattern);
      px(ctx, x + cx, y + cy + 2, pattern);
    }
  }

  // stagger alternate row
  for (let dy = 4; dy < 32; dy += 8) {
    for (let dx = 4; dx < 32; dx += 8) {
      px(ctx, x + dx, y + dy, hi);
    }
  }

  // vertical edge shadows for depth
  rect(ctx, x, y, 1, 32, sh);
  rect(ctx, x + 31, y, 1, 32, sh);

  // top/bottom groove
  if (variant >= 7) {
    rect(ctx, x, y + 30, 32, 2, sh);
  }
}

function drawCarpet(ctx: CanvasRenderingContext2D, x: number, y: number, variant: number): void {
  // Rich green carpet like the reference image
  const base = variant <= 10 ? '#5A8B5A' : '#4E7A4E';
  const hi = '#6E9E6E';
  const sh = '#4A7248';
  const fiber1 = '#5E8F5E';
  const fiber2 = '#508050';
  const border = '#3E6438';
  const borderHi = '#4E7848';

  rect(ctx, x, y, 32, 32, base);

  // carpet fiber texture - tiny dots in a grid
  for (let cy = 0; cy < 32; cy += 2) {
    for (let cx = 0; cx < 32; cx += 2) {
      const isAlt = ((cx + cy) / 2) % 3 === 0;
      if (isAlt) {
        px(ctx, x + cx, y + cy, fiber1);
      } else if (((cx + cy) / 2) % 5 === 0) {
        px(ctx, x + cx, y + cy, fiber2);
      }
    }
  }

  // subtle highlight at top
  for (let cx = 2; cx < 30; cx += 4) {
    px(ctx, x + cx, y + 1, hi);
  }

  // border tile variant (edge of rug)
  if (variant === 9 || variant === 10) {
    rect(ctx, x, y, 32, 3, border);
    rect(ctx, x, y + 1, 32, 1, borderHi);
    rect(ctx, x, y + 29, 32, 3, border);
    rect(ctx, x, y + 30, 32, 1, sh);
  }
  if (variant === 10 || variant === 11) {
    rect(ctx, x, y, 3, 32, border);
    rect(ctx, x + 1, y, 1, 32, borderHi);
    rect(ctx, x + 29, y, 3, 32, border);
    rect(ctx, x + 30, y, 1, 32, sh);
  }
}

function drawBrickWall(ctx: CanvasRenderingContext2D, x: number, y: number, variant: number): void {
  const brickA = '#A0704A';
  const brickB = '#946648';
  const brickHi = '#B88060';
  const mortar = '#6B4832';
  const mortarSh = '#5A3C28';

  rect(ctx, x, y, 32, 32, mortar);

  // rows of bricks
  for (let row = 0; row < 4; row++) {
    const ry = y + row * 8;
    const offset = row % 2 === 0 ? 0 : 8;
    for (let bx = -8 + offset; bx < 32; bx += 16) {
      const brickX = Math.max(x, x + bx);
      const brickW = Math.min(14, x + 32 - brickX);
      if (brickW <= 0) continue;
      const color = ((bx + row * 3 + variant) % 3 === 0) ? brickA : brickB;
      rect(ctx, brickX, ry + 1, brickW, 6, color);
      // brick top highlight
      rect(ctx, brickX, ry + 1, brickW, 1, brickHi);
      // brick bottom shadow
      rect(ctx, brickX, ry + 6, brickW, 1, mix(color, '#000000', 0.2));
      // mortar shadow below
      rect(ctx, brickX, ry + 7, brickW, 1, mortarSh);

      // texture detail on brick face
      if (brickW > 6) {
        px(ctx, brickX + 3, ry + 3, mix(color, '#000000', 0.1));
        px(ctx, brickX + 7, ry + 4, mix(color, '#ffffff', 0.08));
      }
    }
  }
}

function drawDarkWood(ctx: CanvasRenderingContext2D, x: number, y: number, variant: number): void {
  const base = '#5C3D2E';
  const hi = '#7A5842';
  const sh = '#3E2A1E';
  const grain = '#4E3428';
  const edge = '#2E1A12';

  rect(ctx, x, y, 32, 32, base);

  // wood grain vertical streaks
  for (let gx = 2; gx < 30; gx += 5) {
    const offset = (gx * 3 + variant * 7) % 4;
    rect(ctx, x + gx, y + offset, 1, 32 - offset, grain);
  }

  // highlight strip
  rect(ctx, x + 2, y + 1, 8, 1, hi);
  rect(ctx, x + 18, y + 1, 6, 1, hi);

  // darker bottom edge
  rect(ctx, x, y + 30, 32, 2, sh);
  rect(ctx, x, y, 32, 1, edge);

  // panel inset for furniture-like detail
  if (variant >= 14) {
    rect(ctx, x + 4, y + 4, 24, 24, mix(base, '#000000', 0.1));
    rect(ctx, x + 5, y + 5, 22, 22, base);
    rect(ctx, x + 5, y + 5, 22, 1, hi);
    rect(ctx, x + 5, y + 26, 22, 1, sh);
  }
}

function drawTile(ctx: CanvasRenderingContext2D, index: number, x: number, y: number): void {
  if (index <= 1) {
    drawWoodFloor(ctx, x, y, index);
    return;
  }
  if (index <= 5) {
    drawWallPanel(ctx, x, y, index);
    return;
  }
  if (index <= 8) {
    drawPurpleWall(ctx, x, y, index);
    return;
  }
  if (index <= 11) {
    drawCarpet(ctx, x, y, index);
    return;
  }
  // 12-15: dark wood / brick outer walls
  if (index <= 13) {
    drawBrickWall(ctx, x, y, index);
    return;
  }
  drawDarkWood(ctx, x, y, index);
}

/* ── object sprites  ──────────────────────────────────────────────── */

function drawFoodBowl(ctx: CanvasRenderingContext2D): void {
  const OL = '#3A2618';
  const bowl = '#C8783C';
  const bowlHi = '#DA9458';
  const bowlSh = '#9E5E2E';
  const rim = '#E0A868';
  const inside = '#8B5E3C';
  const kibbleA = '#A06830';
  const kibbleB = '#8B5828';
  const kibbleC = '#C47838';

  // shadow on ground
  rect(ctx, 6, 26, 20, 3, 'rgba(0,0,0,0.15)');

  // bowl body - rounded shape
  //         top rim
  rect(ctx, 8, 14, 16, 1, OL);
  rect(ctx, 7, 15, 18, 1, rim);
  rect(ctx, 6, 16, 20, 1, rim);
  //         outer bowl
  rect(ctx, 5, 17, 22, 1, OL);
  rect(ctx, 6, 17, 20, 1, bowlHi);
  rect(ctx, 5, 18, 22, 6, bowl);
  rect(ctx, 6, 18, 2, 5, bowlHi);    // left highlight
  rect(ctx, 22, 18, 3, 5, bowlSh);   // right shadow
  //         bottom curve
  rect(ctx, 7, 24, 18, 1, bowlSh);
  rect(ctx, 9, 25, 14, 1, OL);

  // inside of bowl visible at top
  rect(ctx, 8, 15, 16, 3, inside);
  rect(ctx, 9, 15, 14, 1, mix(inside, '#ffffff', 0.15));

  // kibble pieces in the bowl
  rect(ctx, 10, 15, 2, 2, kibbleA);
  rect(ctx, 13, 16, 2, 1, kibbleB);
  rect(ctx, 16, 15, 2, 2, kibbleC);
  rect(ctx, 19, 16, 2, 1, kibbleA);
  px(ctx, 12, 15, kibbleC);
  px(ctx, 15, 16, kibbleB);
  px(ctx, 18, 15, kibbleA);

  // outline top
  px(ctx, 7, 14, OL); px(ctx, 24, 14, OL);
  rect(ctx, 5, 17, 1, 7, OL);
  rect(ctx, 26, 17, 1, 7, OL);
}

function drawWaterBowl(ctx: CanvasRenderingContext2D): void {
  const OL = '#1E3048';
  const bowl = '#4A82B8';
  const bowlHi = '#6AA0D0';
  const bowlSh = '#3A6A98';
  const rim = '#78B0DC';
  const water = '#5CACEE';
  const waterHi = '#90D0FF';
  const waterSh = '#4890CC';
  const shine = '#C8E8FF';

  // shadow
  rect(ctx, 6, 26, 20, 3, 'rgba(0,0,0,0.15)');

  // bowl body
  rect(ctx, 8, 14, 16, 1, OL);
  rect(ctx, 7, 15, 18, 1, rim);
  rect(ctx, 6, 16, 20, 1, rim);
  rect(ctx, 5, 17, 22, 1, OL);
  rect(ctx, 6, 17, 20, 1, bowlHi);
  rect(ctx, 5, 18, 22, 6, bowl);
  rect(ctx, 6, 18, 2, 5, bowlHi);
  rect(ctx, 22, 18, 3, 5, bowlSh);
  rect(ctx, 7, 24, 18, 1, bowlSh);
  rect(ctx, 9, 25, 14, 1, OL);

  // water surface
  rect(ctx, 8, 15, 16, 4, water);
  rect(ctx, 9, 15, 14, 1, waterHi);
  rect(ctx, 9, 18, 14, 1, waterSh);

  // water shine / reflection
  rect(ctx, 11, 16, 3, 1, shine);
  px(ctx, 15, 16, shine);
  px(ctx, 12, 17, mix(shine, water, 0.5));

  // outline
  px(ctx, 7, 14, OL); px(ctx, 24, 14, OL);
  rect(ctx, 5, 17, 1, 7, OL);
  rect(ctx, 26, 17, 1, 7, OL);
}

function drawLitterBox(ctx: CanvasRenderingContext2D): void {
  const OL = '#3A2E20';
  const tray = '#7A8E6A';
  const trayHi = '#92A880';
  const traySh = '#5E7250';
  const rim = '#8CA07A';
  const sand = '#D8CCA0';
  const sandHi = '#E8DEB8';
  const sandSh = '#C4B888';
  const sandDot = '#B8A878';

  // shadow
  rect(ctx, 4, 27, 24, 3, 'rgba(0,0,0,0.12)');

  // tray body - wider rectangular box
  rect(ctx, 4, 12, 24, 1, OL);
  rect(ctx, 3, 13, 26, 1, rim);
  rect(ctx, 3, 14, 26, 1, rim);
  rect(ctx, 2, 15, 28, 1, OL);
  rect(ctx, 3, 15, 26, 1, trayHi);
  rect(ctx, 2, 16, 28, 10, tray);
  rect(ctx, 3, 16, 2, 9, trayHi);
  rect(ctx, 25, 16, 3, 9, traySh);
  rect(ctx, 4, 26, 24, 1, traySh);
  rect(ctx, 5, 27, 22, 1, OL);

  // sand fill
  rect(ctx, 5, 14, 22, 5, sand);
  rect(ctx, 6, 14, 20, 1, sandHi);
  rect(ctx, 6, 18, 20, 1, sandSh);

  // sand granule texture
  for (let sy = 15; sy < 18; sy++) {
    for (let sx = 6; sx < 26; sx += 3) {
      px(ctx, sx, sy, sandDot);
    }
    for (let sx = 8; sx < 26; sx += 4) {
      px(ctx, sx, sy, sandHi);
    }
  }

  // small paw print detail in sand
  px(ctx, 12, 15, sandSh); px(ctx, 14, 15, sandSh);
  px(ctx, 13, 16, sandSh);
  px(ctx, 19, 16, sandSh); px(ctx, 21, 16, sandSh);
  px(ctx, 20, 17, sandSh);

  // outline edges
  rect(ctx, 2, 15, 1, 11, OL);
  rect(ctx, 29, 15, 1, 11, OL);
}

function drawCabinet(ctx: CanvasRenderingContext2D): void {
  const OL = '#2A1E12';
  const wood = '#8B6B42';
  const woodHi = '#A8845A';
  const woodSh = '#6E5234';
  const panel = '#7A5C36';
  const panelHi = '#9A7C52';
  const shelf = '#6E5234';
  const knob = '#D4B070';
  const knobSh = '#B89858';
  const top = '#A0804E';

  // shadow
  rect(ctx, 5, 28, 22, 3, 'rgba(0,0,0,0.15)');

  // cabinet body
  rect(ctx, 4, 3, 24, 1, OL);
  rect(ctx, 3, 4, 26, 1, top);
  rect(ctx, 3, 5, 26, 1, woodHi);
  rect(ctx, 3, 6, 26, 22, wood);
  rect(ctx, 4, 6, 2, 20, woodHi);   // left edge highlight
  rect(ctx, 24, 6, 3, 20, woodSh);  // right shadow

  // top trim
  rect(ctx, 3, 4, 26, 1, OL);
  rect(ctx, 4, 5, 24, 1, top);

  // left door panel
  rect(ctx, 5, 8, 10, 17, panel);
  rect(ctx, 6, 9, 8, 15, wood);
  rect(ctx, 6, 9, 8, 1, panelHi);
  rect(ctx, 6, 23, 8, 1, woodSh);
  // panel groove
  rect(ctx, 7, 11, 6, 1, woodSh);
  rect(ctx, 7, 21, 6, 1, panelHi);

  // right door panel
  rect(ctx, 17, 8, 10, 17, panel);
  rect(ctx, 18, 9, 8, 15, wood);
  rect(ctx, 18, 9, 8, 1, panelHi);
  rect(ctx, 18, 23, 8, 1, woodSh);
  rect(ctx, 19, 11, 6, 1, woodSh);
  rect(ctx, 19, 21, 6, 1, panelHi);

  // door knobs
  rect(ctx, 13, 16, 2, 2, knob);
  px(ctx, 13, 16, knobSh);
  rect(ctx, 17, 16, 2, 2, knob);
  px(ctx, 18, 16, knobSh);

  // center line between doors
  rect(ctx, 15, 8, 2, 17, OL);

  // shelf line visible through doors (horizontal)
  rect(ctx, 6, 15, 8, 1, shelf);
  rect(ctx, 18, 15, 8, 1, shelf);

  // base / feet
  rect(ctx, 3, 26, 26, 1, woodSh);
  rect(ctx, 4, 27, 24, 1, OL);
  // feet
  rect(ctx, 5, 27, 3, 1, woodSh);
  rect(ctx, 24, 27, 3, 1, woodSh);

  // outline
  rect(ctx, 3, 5, 1, 22, OL);
  rect(ctx, 28, 5, 1, 22, OL);
}

function drawToyBasket(ctx: CanvasRenderingContext2D): void {
  const OL = '#3A2418';
  const basket = '#B07840';
  const basketHi = '#C89058';
  const basketSh = '#8B5E30';
  const weave1 = '#A06C38';
  const weave2 = '#C48850';
  const rim = '#9E6830';
  const ballRed = '#E05040';
  const ballRedSh = '#B83830';
  const ballBlue = '#5088D0';
  const ballBlueSh = '#3868A8';
  const mouse = '#909090';
  const mouseSh = '#686868';
  const mouseEar = '#E8A0A0';
  const feather = '#E0C040';
  const featherSh = '#C0A030';
  const string = '#D8D0C0';

  // shadow
  rect(ctx, 5, 27, 22, 3, 'rgba(0,0,0,0.12)');

  // basket body - woven round shape
  rect(ctx, 7, 12, 18, 1, OL);
  rect(ctx, 6, 13, 20, 1, rim);
  rect(ctx, 5, 14, 22, 1, rim);
  rect(ctx, 4, 15, 24, 1, OL);
  rect(ctx, 5, 15, 22, 1, basketHi);
  rect(ctx, 4, 16, 24, 10, basket);
  rect(ctx, 5, 16, 2, 9, basketHi);
  rect(ctx, 22, 16, 4, 9, basketSh);
  rect(ctx, 6, 26, 20, 1, basketSh);
  rect(ctx, 8, 27, 16, 1, OL);

  // woven texture pattern
  for (let wy = 16; wy < 26; wy += 2) {
    for (let wx = 5; wx < 26; wx += 4) {
      rect(ctx, wx, wy, 2, 1, weave1);
      rect(ctx, wx + 2, wy + 1, 2, 1, weave2);
    }
  }

  // outline
  rect(ctx, 4, 15, 1, 11, OL);
  rect(ctx, 27, 15, 1, 11, OL);

  // === toys sticking out of the basket ===

  // red ball (left)
  rect(ctx, 8, 10, 4, 4, ballRed);
  rect(ctx, 9, 9, 2, 1, ballRed);
  rect(ctx, 9, 14, 2, 1, ballRed);
  px(ctx, 8, 10, ballRedSh);
  px(ctx, 11, 10, ballRedSh);
  px(ctx, 9, 10, mix(ballRed, '#ffffff', 0.3)); // shine

  // blue ball (right)
  rect(ctx, 19, 10, 4, 4, ballBlue);
  rect(ctx, 20, 9, 2, 1, ballBlue);
  rect(ctx, 20, 14, 2, 1, ballBlue);
  px(ctx, 19, 10, ballBlueSh);
  px(ctx, 22, 10, ballBlueSh);
  px(ctx, 20, 10, mix(ballBlue, '#ffffff', 0.3));

  // toy mouse (center)
  rect(ctx, 13, 9, 5, 3, mouse);
  rect(ctx, 14, 8, 3, 1, mouse);
  px(ctx, 13, 10, mouseSh); px(ctx, 17, 10, mouseSh);
  // ears
  px(ctx, 14, 7, mouseEar); px(ctx, 16, 7, mouseEar);
  // eyes
  px(ctx, 14, 9, '#222222'); px(ctx, 16, 9, '#222222');
  // tail
  px(ctx, 18, 10, string); px(ctx, 19, 9, string); px(ctx, 20, 8, string);

  // feather wand sticking up
  rect(ctx, 24, 4, 1, 10, '#8B6B42');
  rect(ctx, 23, 3, 3, 1, feather);
  rect(ctx, 23, 2, 3, 1, feather);
  px(ctx, 24, 1, feather);
  px(ctx, 23, 2, featherSh);
  px(ctx, 25, 3, featherSh);
}

function drawUIPanel(ctx: CanvasRenderingContext2D): void {
  const bg = '#E8EED8';
  const border = '#8BAE6A';
  const borderHi = '#A8C890';
  const borderSh = '#6A8E50';
  const inner = '#F0F6E4';

  rect(ctx, 0, 0, 32, 32, border);
  rect(ctx, 1, 1, 30, 30, borderHi);
  rect(ctx, 2, 2, 28, 28, bg);
  rect(ctx, 3, 3, 26, 26, inner);

  // corner bevels
  px(ctx, 0, 0, borderSh); px(ctx, 31, 0, borderSh);
  px(ctx, 0, 31, borderSh); px(ctx, 31, 31, borderSh);

  // bottom/right shadow edge
  rect(ctx, 1, 30, 30, 1, borderSh);
  rect(ctx, 30, 1, 1, 30, borderSh);
}

function drawObjectSprite(
  scene: Phaser.Scene,
  key: string,
  drawFn: (ctx: CanvasRenderingContext2D) => void,
): void {
  if (scene.textures.exists(key)) {
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = TILE_SIZE;
  canvas.height = TILE_SIZE;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas context unavailable while generating room sprites');
  }

  ctx.imageSmoothingEnabled = false;
  drawFn(ctx);

  scene.textures.addImage(key, canvas as unknown as HTMLImageElement);
}

/* ── main entry ────────────────────────────────────────────────────── */

export function generateRoomSprites(scene: Phaser.Scene): void {
  if (!scene.textures.exists('tileset_house')) {
    const rows = Math.ceil(TILE_COUNT / TILESET_COLS);
    const canvas = document.createElement('canvas');
    canvas.width = TILESET_COLS * TILE_SIZE;
    canvas.height = rows * TILE_SIZE;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas context unavailable while generating tileset');
    }

    ctx.imageSmoothingEnabled = false;

    for (let i = 0; i < TILE_COUNT; i += 1) {
      const col = i % TILESET_COLS;
      const row = Math.floor(i / TILESET_COLS);
      drawTile(ctx, i, col * TILE_SIZE, row * TILE_SIZE);
    }

    scene.textures.addImage('tileset_house', canvas as unknown as HTMLImageElement);
  }

  drawObjectSprite(scene, 'obj_food_bowl', drawFoodBowl);
  drawObjectSprite(scene, 'obj_water_bowl', drawWaterBowl);
  drawObjectSprite(scene, 'obj_litter_box', drawLitterBox);
  drawObjectSprite(scene, 'obj_cabinet', drawCabinet);
  drawObjectSprite(scene, 'obj_toy_basket', drawToyBasket);
  drawObjectSprite(scene, 'ui_panel', drawUIPanel);
}
