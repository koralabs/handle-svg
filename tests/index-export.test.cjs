const test = require('node:test');
const assert = require('node:assert/strict');

const moduleExports = require('../lib/index.js');

test('library index exposes default HandleSvg and utility exports', () => {
    assert.equal(typeof moduleExports.default, 'function');
    assert.equal(typeof moduleExports.getRarityFromLength, 'function');
    assert.equal(typeof moduleExports.getSocialIcon, 'function');
    assert.equal(typeof moduleExports.getImageDetails, 'function');
});
