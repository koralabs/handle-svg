const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const { checkContrast } = require('../lib/utils/checkContrast.js');
const { getMaxOffset } = require('../lib/utils/getMaxOffset.js');
const constants = require('../lib/utils/constants.js');

const imageHelpersPath = require.resolve('../lib/utils/imageHelpers.js');

const loadImageHelpers = (mockFetch) => {
    const originalLoad = Module._load;
    Module._load = function (request, parent, isMain) {
        if (request === 'cross-fetch') return mockFetch;
        return originalLoad.call(this, request, parent, isMain);
    };

    delete require.cache[imageHelpersPath];
    try {
        return require(imageHelpersPath);
    } finally {
        Module._load = originalLoad;
    }
};

test('checkContrast handles default threshold and alpha inputs', () => {
    assert.equal(checkContrast('#000000', '#ffffff'), true);
    assert.equal(checkContrast('#77777780', '#888888ff', 6), false);
});

test('getMaxOffset handles explicit zoom and fallback zoom', () => {
    assert.equal(getMaxOffset(200), 288);
    assert.equal(getMaxOffset(0), 0);
});

test('buildFallbackUrl appends pinata token only for pinata gateway', () => {
    const { buildFallbackUrl } = loadImageHelpers(async () => {
        throw new Error('fetch should not be called');
    });

    const filebaseUrl = buildFallbackUrl('ipfs://abc', 0);
    const pinataUrl = buildFallbackUrl('ipfs://abc', 1);

    assert.equal(filebaseUrl.includes('pinataGatewayToken='), false);
    assert.equal(pinataUrl.includes('pinataGatewayToken='), true);
});

test('getImageDetails returns metadata without base64 for direct URLs', async () => {
    const calls = [];
    const { getImageDetails } = loadImageHelpers(async (url) => {
        calls.push(url);
        return {
            ok: true,
            headers: { get: () => 'image/png' },
            arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer
        };
    });

    const result = await getImageDetails({
        imageUrl: 'https://example.com/file.png',
        useBase64: false
    });

    assert.deepEqual(calls, ['https://example.com/file.png']);
    assert.deepEqual(result, {
        imageUrl: 'https://example.com/file.png',
        contentType: 'image/png',
        base64: ''
    });
});

test('getImageDetails returns base64 payload for ipfs URLs', async () => {
    const calls = [];
    const { getImageDetails } = loadImageHelpers(async (url) => {
        calls.push(url);
        return {
            ok: true,
            headers: { get: () => 'image/jpeg' },
            arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer
        };
    });

    const result = await getImageDetails({
        imageUrl: 'ipfs://abc123',
        useBase64: true
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].includes('/ipfs/abc123'), true);
    assert.deepEqual(result, {
        imageUrl: calls[0],
        contentType: 'image/jpeg',
        base64: 'AQID'
    });
});

test('getImageDetails retries with next gateway on failure', async () => {
    const calls = [];
    const { getImageDetails } = loadImageHelpers(async (url) => {
        calls.push(url);
        if (calls.length === 1) {
            return {
                ok: false,
                headers: { get: () => null },
                arrayBuffer: async () => new ArrayBuffer(0)
            };
        }
        return {
            ok: true,
            headers: { get: () => null },
            arrayBuffer: async () => new ArrayBuffer(0)
        };
    });

    const result = await getImageDetails({
        imageUrl: 'ipfs://retry',
        useBase64: false
    });

    assert.equal(calls.length, 2);
    assert.equal(calls[1].includes('mypinata.cloud'), true);
    assert.equal(result.imageUrl, calls[1]);
    assert.equal(result.contentType, '');
});

test('getImageDetails throws when all gateways fail', async () => {
    const { getImageDetails } = loadImageHelpers(async () => ({
        ok: false,
        headers: { get: () => null },
        arrayBuffer: async () => new ArrayBuffer(0)
    }));

    const lastGatewayIndex = constants.ALL_IPFS_GATEWAYS.length - 1;
    const expectedUrl = `${constants.ALL_IPFS_GATEWAYS[lastGatewayIndex]}/ipfs/fail`;

    await assert.rejects(
        () =>
            getImageDetails({
                imageUrl: 'ipfs://fail',
                useBase64: false,
                gatewayIndex: lastGatewayIndex
            }),
        (error) => {
            assert.equal(error.message.includes(expectedUrl), true);
            return true;
        }
    );
});
