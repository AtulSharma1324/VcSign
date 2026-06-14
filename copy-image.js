const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\Atul Sharma\\.gemini\\antigravity-ide\\brain\\47031606-d761-400a-9aed-d2cc7d10983d\\auth_hero_graphic_1781439574306.png";
const destDir = path.join(__dirname, 'frontend', 'public', 'images');
const dest = path.join(destDir, 'auth_hero.png');

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log("Success! Image copied to: " + dest);
} catch (err) {
  console.error("Failed to copy image:", err);
}
