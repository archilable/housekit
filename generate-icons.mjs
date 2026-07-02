import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';

function drawIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#000000';
  ctx.roundRect(0, 0, size, size, size * 0.22);
  ctx.fill();

  const s = size / 192;

  // House body
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.moveTo(96 * s, 40 * s);
  ctx.lineTo(160 * s, 90 * s);
  ctx.lineTo(160 * s, 155 * s);
  ctx.lineTo(32 * s, 155 * s);
  ctx.lineTo(32 * s, 90 * s);
  ctx.closePath();
  ctx.fill();

  // Roof
  ctx.fillStyle = '#60a5fa';
  ctx.beginPath();
  ctx.moveTo(96 * s, 28 * s);
  ctx.lineTo(170 * s, 92 * s);
  ctx.lineTo(158 * s, 92 * s);
  ctx.lineTo(96 * s, 46 * s);
  ctx.lineTo(34 * s, 92 * s);
  ctx.lineTo(22 * s, 92 * s);
  ctx.closePath();
  ctx.fill();

  // Door
  ctx.fillStyle = '#000000';
  ctx.fillRect(80 * s, 115 * s, 32 * s, 40 * s);

  // Window
  ctx.fillStyle = '#93c5fd';
  ctx.fillRect(110 * s, 90 * s, 28 * s, 24 * s);
  ctx.fillRect(54 * s, 90 * s, 28 * s, 24 * s);

  return canvas.toBuffer('image/png');
}

try {
  writeFileSync('/Users/bennylee/Desktop/housekit/public/icon-192.png', drawIcon(192));
  writeFileSync('/Users/bennylee/Desktop/housekit/public/icon-512.png', drawIcon(512));
  console.log('Icons created!');
} catch(e) {
  console.error(e);
}
