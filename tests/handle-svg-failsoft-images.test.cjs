const test = require('node:test');
const assert = require('node:assert/strict');

const HandleSvg = require('../lib/HandleSvg.js').default;

// getImageDetails (cross-fetch v4 → global fetch) retries every IPFS gateway and
// then throws on terminal failure. These tests assert the optional bg_image / pfp_image
// layers fail SOFT (empty layer, rendering continues) rather than aborting the SVG.
// handle.me#436.
const withFailingFetch = async (fn) => {
    const originalFetch = global.fetch;
    const originalLog = console.log;
    global.fetch = async () => ({ ok: false, status: 504, headers: { get: () => null } });
    console.log = () => {};
    try {
        await fn();
    } finally {
        global.fetch = originalFetch;
        console.log = originalLog;
    }
};

const createRenderer = (options) => new HandleSvg({ size: 1024, handle: 'handle', options });

test('buildBackgroundImage fails soft (empty layer) when bg_image fetch fails on every gateway', async () => {
    await withFailingFetch(async () => {
        const result = await createRenderer({ bg_image: 'ipfs://unreachable-bg' }).buildBackgroundImage();
        assert.equal(result, '');
    });
});

test('buildPfpImage fails soft (empty layer) when pfp_image fetch fails on every gateway', async () => {
    await withFailingFetch(async () => {
        const result = await createRenderer({ pfp_image: 'ipfs://unreachable-pfp' }).buildPfpImage();
        assert.equal(result, '');
    });
});
