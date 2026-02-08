import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const ROOT = path.resolve(process.cwd());
const OUT_DIR = path.join(ROOT, 'public', 'icons');

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

const crcTable = (() => {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i += 1) {
    let c = i;
    for (let k = 0; k < 8; k += 1) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c >>> 0;
  }
  return table;
})();

function crc32(buffer) {
  let c = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    c = crcTable[(c ^ buffer[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBytes = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const payload = Buffer.concat([typeBytes, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(payload), 0);
  return Buffer.concat([len, payload, crc]);
}

function makePng(size, pixels) {
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);

  for (let y = 0; y < size; y += 1) {
    const rowStart = y * (stride + 1);
    raw[rowStart] = 0;
    const srcStart = y * stride;
    pixels.copy(raw, rowStart + 1, srcStart, srcStart + stride);
  }

  const signature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47,
    0x0d, 0x0a, 0x1a, 0x0a,
  ]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  const compressed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

function fillRect(pixels, size, x, y, w, h, r, g, b, a = 255) {
  const x0 = clamp(Math.floor(x), 0, size);
  const y0 = clamp(Math.floor(y), 0, size);
  const x1 = clamp(Math.ceil(x + w), 0, size);
  const y1 = clamp(Math.ceil(y + h), 0, size);
  for (let yy = y0; yy < y1; yy += 1) {
    for (let xx = x0; xx < x1; xx += 1) {
      const i = (yy * size + xx) * 4;
      pixels[i] = r;
      pixels[i + 1] = g;
      pixels[i + 2] = b;
      pixels[i + 3] = a;
    }
  }
}

function drawIcon(size, maskable = false) {
  const pixels = Buffer.alloc(size * size * 4);

  fillRect(pixels, size, 0, 0, size, size, 19, 25, 36, 255);
  const edge = Math.max(8, Math.floor(size * (maskable ? 0.08 : 0.14)));
  fillRect(pixels, size, edge, edge, size - edge * 2, size - edge * 2, 35, 58, 88, 255);
  fillRect(pixels, size, edge + 4, edge + 4, size - (edge + 4) * 2, size - (edge + 4) * 2, 63, 99, 140, 255);

  const scale = size / 64;
  const ox = Math.floor(size * 0.24);
  const oy = Math.floor(size * 0.17);

  const ol = [47, 29, 18];
  const fur = [232, 130, 42];
  const furLight = [246, 171, 88];
  const cream = [240, 222, 186];

  fillRect(pixels, size, ox + 8 * scale, oy + 2 * scale, 8 * scale, 3 * scale, ...ol, 255);
  fillRect(pixels, size, ox + 0 * scale, oy + 9 * scale, 8 * scale, 14 * scale, ...ol, 255);
  fillRect(pixels, size, ox + 16 * scale, oy + 9 * scale, 8 * scale, 14 * scale, ...ol, 255);
  fillRect(pixels, size, ox + 4 * scale, oy + 7 * scale, 16 * scale, 18 * scale, ...fur, 255);
  fillRect(pixels, size, ox + 6 * scale, oy + 9 * scale, 12 * scale, 5 * scale, ...furLight, 255);

  fillRect(pixels, size, ox + 8 * scale, oy + 18 * scale, 8 * scale, 5 * scale, ...cream, 255);
  fillRect(pixels, size, ox + 10 * scale, oy + 15 * scale, 4 * scale, 3 * scale, ...cream, 255);

  fillRect(pixels, size, ox + 6 * scale, oy + 13 * scale, 2 * scale, 2 * scale, ...ol, 255);
  fillRect(pixels, size, ox + 16 * scale, oy + 13 * scale, 2 * scale, 2 * scale, ...ol, 255);
  fillRect(pixels, size, ox + 11 * scale, oy + 17 * scale, 2 * scale, 2 * scale, ...ol, 255);

  fillRect(pixels, size, ox + 8 * scale, oy + 26 * scale, 8 * scale, 16 * scale, ...fur, 255);
  fillRect(pixels, size, ox + 10 * scale, oy + 28 * scale, 4 * scale, 7 * scale, ...furLight, 255);
  fillRect(pixels, size, ox + 8 * scale, oy + 34 * scale, 3 * scale, 8 * scale, ...ol, 255);
  fillRect(pixels, size, ox + 13 * scale, oy + 34 * scale, 3 * scale, 8 * scale, ...ol, 255);

  fillRect(pixels, size, ox + 18 * scale, oy + 30 * scale, 4 * scale, 10 * scale, ...fur, 255);
  fillRect(pixels, size, ox + 22 * scale, oy + 32 * scale, 2 * scale, 8 * scale, ...ol, 255);

  return pixels;
}

function writeIcon(fileName, size, maskable = false) {
  const pixels = drawIcon(size, maskable);
  const png = makePng(size, pixels);
  fs.writeFileSync(path.join(OUT_DIR, fileName), png);
}

function run() {
  fs.mkdirSync(OUT_DIR, { recursive: true });

  writeIcon('pwa-192.png', 192, false);
  writeIcon('pwa-512.png', 512, false);
  writeIcon('pwa-maskable-512.png', 512, true);

  const appleIcon = fs.readFileSync(path.join(OUT_DIR, 'pwa-192.png'));
  fs.writeFileSync(path.join(ROOT, 'public', 'apple-touch-icon.png'), appleIcon);

  console.log('Generated PWA icons in public/icons');
}

run();
