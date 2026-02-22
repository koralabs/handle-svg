const test = require('node:test');
const assert = require('node:assert/strict');

const { getFontArrayBuffer } = require('../lib/utils/getFontArrayBuffer.js');

const withFetch = async (mockFetch, fn) => {
    const originalFetch = global.fetch;
    const originalLog = console.log;
    global.fetch = mockFetch;
    console.log = () => {};
    try {
        await fn();
    } finally {
        global.fetch = originalFetch;
        console.log = originalLog;
    }
};

test('getFontArrayBuffer returns decompressed array buffer for woff2 resources', async () => {
    let decompressCalls = 0;

    await withFetch(async () => ({
        headers: { get: () => 'font/woff2' },
        arrayBuffer: async () => Uint8Array.from([1, 2, 3]).buffer
    }), async () => {
        const result = await getFontArrayBuffer('https://example.com/font.woff2', async () => {
            decompressCalls += 1;
            return Uint8Array.from([9, 8, 7]);
        });

        assert.equal(decompressCalls, 1);
        assert.deepEqual(Array.from(new Uint8Array(result)), [9, 8, 7]);
    });
});

test('getFontArrayBuffer returns original buffer when no decompression is needed', async () => {
    await withFetch(async () => ({
        headers: { get: () => 'font/ttf' },
        arrayBuffer: async () => Uint8Array.from([5, 4, 3]).buffer
    }), async () => {
        const result = await getFontArrayBuffer('https://example.com/font.ttf', async () => {
            throw new Error('decompress should not run');
        });

        assert.deepEqual(Array.from(new Uint8Array(result)), [5, 4, 3]);
    });
});
