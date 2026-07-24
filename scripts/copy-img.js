const fs = require('fs');
const path = require('path');
const dir = 'C:/Users/ayman/.gemini/antigravity/brain/16c462ea-12e9-45e6-b51d-41bc55d98391';
const files = fs.readdirSync(dir).filter(f => f.startsWith('media_') && f.endsWith('.jpg'));
files.sort((a, b) => fs.statSync(path.join(dir, b)).mtimeMs - fs.statSync(path.join(dir, a)).mtimeMs);
if (files.length > 0) {
  fs.copyFileSync(path.join(dir, files[0]), './public/brand-vans-hero.jpg');
  console.log('Copied ' + files[0]);
} else {
  console.log('No images found');
}
