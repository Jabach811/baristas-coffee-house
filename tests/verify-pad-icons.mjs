import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const configPath = path.join(root, 'pad-content.js');
const menuPath = path.join(root, 'qr-menu.html');
const iconRoot = path.join(root, 'assets', 'pad-icons');

const expectedFiles = [
  'dirty-derrick', 'derrick', 'rocky-road', 'creme-brulee', 'caramel-crunch',
  'caramel-sensation', 'snicker-bar', 'butterfinger', 'peanut-butter-bliss',
  'coffee-toffee-crunch', 'double-chocolate-truffle', 'dark-chocolate-mocha',
  'white-mocha', 'blended-mocha', 'mexican-mocha', 'toasted-almond',
  'coconut-almond', 'coconut-craze', 'hawaiian-banana-nut', 'blackberry-vanilla',
  'snowflake', 'frosted-latte', 'skinny-dip-latte', 'exotic-spiced-chai',
  'flamingo-chai', 'in-the-raw', 'sicilian-latte', 'mocha-valencia',
  'cafe-barista', 'black-and-white', 'gingerbread-latte', 'jack-frost',
  'holly-jolly', 'maple-spice', 'merry-mocha-mint', 'white-christmas',
  'tropical-island', 'oreo-smoothie', 'green-tea-smoothie', 'slinger',
  'iced-latte', 'iced-mocha', 'iced-chai', 'iced-tea', 'espresso', 'hot-latte',
  'hot-mocha', 'hot-chai', 'hot-tea', 'traveler', 'smoothie', 'panini', 'bagel',
  'croissant', 'breakfast', 'pastry', 'snack', 'milk-whole', 'milk-2',
  'milk-nonfat', 'milk-oat', 'milk-almond', 'milk-soy',
];

const sharedAliases = {
  'rocky-road-b': 'rocky-road',
  'creme-brulee-b': 'creme-brulee',
  'caramel-sensation-b': 'caramel-sensation',
  'snicker-bar-b': 'snicker-bar',
  'dark-chocolate-mocha-b': 'dark-chocolate-mocha',
  'white-mocha-b': 'white-mocha',
  'toasted-almond-b': 'toasted-almond',
};

function parseConfiguredIcons(source) {
  const block = source.match(/icons:\s*\{([\s\S]*?)\n\s*\},/)?.[1];
  assert.ok(block, 'pad-content.js exposes an icons map');
  return Object.fromEntries(
    [...block.matchAll(/'([^']+)'\s*:\s*'([^']+)'/g)].map(([, key, value]) => [key, value]),
  );
}

function readPngDimensions(filePath) {
  const bytes = fs.readFileSync(filePath);
  assert.deepEqual(
    [...bytes.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    `${path.basename(filePath)} is a real PNG`,
  );
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

const configSource = fs.readFileSync(configPath, 'utf8');
const menuSource = fs.readFileSync(menuPath, 'utf8');
const icons = parseConfiguredIcons(configSource);

assert.equal(expectedFiles.length, 63, 'the approved shopping list contains 63 files');
assert.equal(Object.keys(icons).length, 70, '70 configured keys include seven shared blended aliases');
assert.match(configSource, /iconBase:\s*'assets\/pad-icons\/'/, 'the order pad reads assets/pad-icons/');

const menuKeys = [...menuSource.matchAll(/data-icon="([^"]+)"/g)].map(([, key]) => key);
assert.equal(menuKeys.length, 155, 'all 155 order rows expose an icon key');
for (const key of new Set(menuKeys)) {
  assert.ok(key in icons, `${key} used by qr-menu.html exists in pad-content.js`);
}

for (const [alias, file] of Object.entries(sharedAliases)) {
  assert.equal(icons[alias], file, `${alias} shares ${file}.png`);
}

for (const file of expectedFiles) {
  assert.equal(icons[file], file, `${file} is wired without the .png suffix`);
  const filePath = path.join(iconRoot, `${file}.png`);
  assert.ok(fs.existsSync(filePath), `${file}.png exists`);
  assert.deepEqual(readPngDimensions(filePath), { width: 192, height: 192 }, `${file}.png is 192×192`);
}

console.log('Verified 63 coin PNGs, 70 wired keys, 7 shared aliases, and all 155 order rows.');
