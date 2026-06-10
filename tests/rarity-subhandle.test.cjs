const test = require('node:test');
const assert = require('node:assert/strict');

const { getRarityHex, getRarityHandleSegment } = require('../lib/utils/index.js');

test('getRarityHandleSegment returns the root for a subhandle, the handle otherwise', () => {
    assert.equal(getRarityHandleSegment('sub@root'), 'root');
    assert.equal(getRarityHandleSegment('root'), 'root');
});

test('subhandle rarity color matches its root handle, not the combined length (handle.me#872)', () => {
    // 'a' is a 1-char Legendary root.
    assert.equal(getRarityHex('sub@a'), getRarityHex('a'));
    assert.equal(getRarityHex('sub@a'), '#f4900c'); // Legendary
    // 'subxa' (no @) is 5 chars -> Common; the subhandle must NOT pick that up.
    assert.notEqual(getRarityHex('sub@a'), getRarityHex('subxa'));
});

test('root-handle rarity is unchanged', () => {
    assert.equal(getRarityHex('ab'), '#593292'); // 2-char Ultra Rare
    assert.equal(getRarityHex('abcd'), '#0cd15b'); // 4-char Common
});
