import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const galleryPath = path.join(root, 'pad-icon-gallery.html');
const configPath = path.join(root, 'pad-content.js');

assert.ok(fs.existsSync(galleryPath), 'pad-icon-gallery.html exists');

const gallerySource = fs.readFileSync(galleryPath, 'utf8');
const dataMatch = gallerySource.match(
  /<script\s+type="application\/json"\s+id="icon-data">([\s\S]*?)<\/script>/i,
);
assert.ok(dataMatch, 'gallery exposes its icon inventory as JSON');

const galleryItems = JSON.parse(dataMatch[1]);
assert.equal(galleryItems.length, 63, 'gallery presents all 63 production files');
assert.equal(new Set(galleryItems.map((item) => item.file)).size, 63, 'gallery filenames are unique');
assert.equal(galleryItems.filter((item) => item.group === 'custom').length, 40, 'gallery has 40 custom drinks');
assert.equal(galleryItems.filter((item) => item.group === 'category').length, 17, 'gallery has 17 category coins');
assert.equal(galleryItems.filter((item) => item.group === 'milk').length, 6, 'gallery has 6 milk coins');

const initialDialogSource = gallerySource.match(/id="dialog-art"\s+src="([^"]*)"/)?.[1];
assert.ok(initialDialogSource?.startsWith('assets/pad-icons/'), 'the hidden dialog starts with a valid icon asset');
assert.ok(
  galleryItems.some((item) => initialDialogSource === `assets/pad-icons/${item.file}.png`),
  'the hidden dialog source belongs to the gallery inventory',
);

const configSource = fs.readFileSync(configPath, 'utf8');
const iconsBlock = configSource.match(/icons:\s*\{([\s\S]*?)\n\s*\},/)?.[1];
assert.ok(iconsBlock, 'pad-content.js exposes an icons map');
const configuredFiles = new Set(
  [...iconsBlock.matchAll(/'[^']+'\s*:\s*'([^']+)'/g)].map(([, value]) => value),
);

assert.deepEqual(
  new Set(galleryItems.map((item) => item.file)),
  configuredFiles,
  'gallery inventory matches the distinct files wired in pad-content.js',
);

console.log('Verified gallery coverage for all 63 production icon files.');
