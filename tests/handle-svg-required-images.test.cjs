const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

// getImageDetails / HandleSvg import `fetch` from 'cross-fetch', so we mock the module
// (mirrors tests/utils.test.cjs) rather than global.fetch. handle.me#436.
const imageHelpersPath = require.resolve('../lib/utils/imageHelpers.js');
const handleSvgPath = require.resolve('../lib/HandleSvg.js');

const withMockedCrossFetch = (mockFetch, requirePath) => {
    const originalLoad = Module._load;
    Module._load = function (request) {
        if (request === 'cross-fetch') return mockFetch;
        return originalLoad.apply(this, arguments);
    };
    delete require.cache[imageHelpersPath];
    delete require.cache[handleSvgPath];
    try {
        return require(requirePath);
    } finally {
        Module._load = originalLoad;
    }
};

const failingFetch = async () => ({ ok: false, status: 504, headers: { get: () => null } });
const loadHandleSvg = (mockFetch) => withMockedCrossFetch(mockFetch, handleSvgPath).default;

// --- A PROVIDED image MUST render: if every gateway fails, the whole render throws. ---
test('buildBackgroundImage THROWS when a provided bg_image fails on every gateway', async () => {
    const HandleSvg = loadHandleSvg(failingFetch);
    const svg = new HandleSvg({ size: 1024, handle: 'handle', options: { bg_image: 'ipfs://unreachable-bg' } });
    await assert.rejects(svg.buildBackgroundImage());
});

test('buildPfpImage THROWS when a provided pfp_image fails on every gateway', async () => {
    const HandleSvg = loadHandleSvg(failingFetch);
    const svg = new HandleSvg({ size: 1024, handle: 'handle', options: { pfp_image: 'ipfs://unreachable-pfp' } });
    await assert.rejects(svg.buildPfpImage());
});

// --- A layer is only optional when the image was NEVER provided. ---
test('no bg_image / pfp_image provided -> empty layer, no throw', async () => {
    const HandleSvg = loadHandleSvg(failingFetch);
    const svg = new HandleSvg({ size: 1024, handle: 'handle', options: {} });
    assert.equal(await svg.buildBackgroundImage(), '');
    assert.equal(await svg.buildPfpImage(), '');
});

// --- The hardening: a THROWING gateway (network error) advances to the next provider. ---
test('getImageDetails advances to the next IPFS gateway when one throws (not just on !ok)', async () => {
    let calls = 0;
    const flakyFetch = async () => {
        calls += 1;
        if (calls === 1) throw new Error('gateway down');
        return { ok: true, headers: { get: () => 'image/png' }, arrayBuffer: async () => Buffer.from('x') };
    };
    const { getImageDetails } = withMockedCrossFetch(flakyFetch, imageHelpersPath);
    const r = await getImageDetails({ imageUrl: 'ipfs://cid', useBase64: true });
    assert.equal(r.contentType, 'image/png');
    assert.ok(calls >= 2, 'should have advanced past the throwing gateway');
});
