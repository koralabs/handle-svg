const test = require('node:test');
const assert = require('node:assert/strict');
const { checkBackdropContrast } = require('../lib/utils/checkBackdropContrast.js');

const solid = (r, g, b, a, count) => Array.from({ length: count }, () => [r, g, b, a]).flat();

test('white text over a dark backdrop is sufficient', () => {
    const res = checkBackdropContrast(solid(10, 10, 10, 255, 50), '#ffffff');
    assert.deepEqual(res, { sufficient: true, failingFraction: 0, sampled: 50 });
});

test('white text over a white image region is insufficient even if the flat bg colour is dark', () => {
    // the bug: bg_color is dark but a bright image sits under the text
    const res = checkBackdropContrast(solid(255, 255, 255, 255, 50), '#ffffff');
    assert.equal(res.sufficient, false);
    assert.equal(res.failingFraction, 1);
});

test('a backdrop that is mostly fine but partly bright is judged by the failing share', () => {
    const px = [...solid(0, 0, 0, 255, 70), ...solid(255, 255, 255, 255, 30)];
    const res = checkBackdropContrast(px, '#ffffff');
    assert.equal(res.failingFraction, 0.3);
    assert.equal(res.sufficient, false);
    assert.equal(checkBackdropContrast(px, '#ffffff', 1.2, 0.35).sufficient, true);
});

test('transparent pixels are skipped; semi-transparent ones blend toward white', () => {
    const px = [...solid(0, 0, 0, 0, 10), ...solid(0, 0, 0, 10, 10)];
    const res = checkBackdropContrast(px, '#ffffff');
    assert.equal(res.sampled, 10);
    assert.equal(res.sufficient, false);
});

test('empty region has nothing behind the text, so it is sufficient', () => {
    assert.deepEqual(checkBackdropContrast([], '#000000'), { sufficient: true, failingFraction: 0, sampled: 0 });
});

test('non-RGBA input is rejected', () => {
    assert.throws(() => checkBackdropContrast([1, 2, 3], '#fff'), /RGBA/);
});
