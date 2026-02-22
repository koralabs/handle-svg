const test = require('node:test');
const assert = require('node:assert/strict');

const {
    getRarityFromLength,
    getRarityHex,
    getMinimumFontSize,
    hexToColorHex,
    getFontDetails
} = require('../lib/utils/index.js');

test('utils index rarity helpers cover all rarity branches', () => {
    assert.equal(getRarityFromLength(1), 'Legendary');
    assert.equal(getRarityFromLength(2), 'Ultra Rare');
    assert.equal(getRarityFromLength(3), 'Rare');
    assert.equal(getRarityFromLength(4), 'Common');
    assert.equal(getRarityFromLength(8), 'Basic');

    assert.equal(getRarityHex('a'), '#f4900c');
    assert.equal(getRarityHex('ab'), '#593292');
    assert.equal(getRarityHex('abc'), '#55acee');
    assert.equal(getRarityHex('abcd'), '#0cd15b');
    assert.equal(getRarityHex('abcdefgh'), '#ffffff');

    assert.equal(getMinimumFontSize('a'), 95);
    assert.equal(getMinimumFontSize('ab'), 95);
    assert.equal(getMinimumFontSize('abc'), 95);
    assert.equal(getMinimumFontSize('abcd'), 180);
    assert.equal(getMinimumFontSize('abcdefgh'), 180);
});

test('utils index supports color and font helpers', () => {
    assert.equal(hexToColorHex('0xff00ff'), '#ff00ff');

    const defaultFont = 'https://fonts.gstatic.com/s/ubuntumono/v15/KFO-CneDtsqEr0keqCMhbC-BL9H1tY0.woff2';
    assert.equal(getFontDetails(''), defaultFont);
    assert.equal(getFontDetails(undefined), defaultFont);
    assert.equal(getFontDetails('no-extension'), defaultFont);
    assert.equal(getFontDetails('name,https://example.com/font.woff2'), 'https://example.com/font.woff2');
    assert.equal(getFontDetails('https://example.com/font.ttf'), 'https://example.com/font.ttf');
});
