const fs = require('fs');
const path = require('path');

const filesToCopy = [
  {
    src: 'C:\\Users\\ayman\\.gemini\\antigravity\\brain\\16c462ea-12e9-45e6-b51d-41bc55d98391\\impressum_hero_1776633363345.png',
    dest: 'public/impressum-hero.png'
  },
  {
    src: 'C:\\Users\\ayman\\.gemini\\antigravity\\brain\\16c462ea-12e9-45e6-b51d-41bc55d98391\\datenschutz_hero_1776633376455.png',
    dest: 'public/datenschutz-hero.png'
  },
  {
    src: 'C:\\Users\\ayman\\.gemini\\antigravity\\brain\\16c462ea-12e9-45e6-b51d-41bc55d98391\\agb_hero_1776633390364.png',
    dest: 'public/agb-hero.png'
  }
];

filesToCopy.forEach(({src, dest}) => {
  try {
    fs.copyFileSync(src, path.join(__dirname, dest));
    console.log(`Copied ${dest} successfully`);
  } catch(e) {
    console.error(`Error copying ${dest}`, e);
  }
});
