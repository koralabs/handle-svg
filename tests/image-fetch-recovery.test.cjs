const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

const imageHelpersPath = require.resolve('../lib/utils/imageHelpers.js');
const NOW = Date.UTC(2026, 9, 8);
const IMAGE_URL = 'https://images.example.test/asset.png';
const RECOVERY_URL = 'https://recovery.example.test/image?asset=first';
const PAYLOAD = Buffer.from('recovered image');

const loadImageHelpers = (mockFetch) => {
    const originalLoad = Module._load;
    Module._load = function (request) {
        if (request === 'cross-fetch') return mockFetch;
        return originalLoad.apply(this, arguments);
    };
    delete require.cache[imageHelpersPath];
    try {
        return require(imageHelpersPath);
    } finally {
        Module._load = originalLoad;
    }
};

const imageResponse = () => ({
    ok: true,
    status: 200,
    headers: { get: () => 'image/webp' },
    arrayBuffer: async () => PAYLOAD
});
const failureResponse = (status, retryAfter) => ({
    ok: false,
    status,
    headers: { get: (name) => name === 'retry-after' ? retryAfter : null }
});
const expectedImage = (imageUrl) => ({ imageUrl, contentType: 'image/webp', base64: PAYLOAD.toString('base64') });
const flush = () => new Promise((resolve) => setImmediate(resolve));

// Feature: an HTTP-date Retry-After on 503 suppresses the gateway for other assets until expiry.
// Failure: repeated renders retry an unavailable gateway. Removing HTTP-date parsing fails the
// second result's URL assertion; treating the delay as permanent fails the final result assertion.
test('503 HTTP-date cooldown applies across assets and expires at the stated time', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: NOW });
    const calls = [];
    let primaryAttempts = 0;
    const { getImageDetails, buildFallbackUrl } = loadImageHelpers(async (url) => {
        calls.push(url);
        if (new URL(url).host === 'public-handles.myfilebase.com' && primaryAttempts++ === 0) {
            return failureResponse(503, new Date(NOW + 5_000).toUTCString());
        }
        return imageResponse();
    });
    const request = (asset) => getImageDetails({ imageUrl: `ipfs://${asset}`, useBase64: true });

    assert.deepEqual(await request('first'), expectedImage(buildFallbackUrl('ipfs://first', 1)));
    t.mock.timers.tick(4_999);
    assert.deepEqual(await request('second'), expectedImage(buildFallbackUrl('ipfs://second', 1)));
    t.mock.timers.tick(1);
    assert.deepEqual(await request('third'), expectedImage(buildFallbackUrl('ipfs://third', 0)));
    assert.deepEqual(calls, [
        buildFallbackUrl('ipfs://first', 0), buildFallbackUrl('ipfs://first', 1),
        buildFallbackUrl('ipfs://second', 1), buildFallbackUrl('ipfs://third', 0)
    ]);
});

// Feature: unusable/expired delays and non-rate-limit failures do not suppress future image loads.
// Failure: transient errors leave a healthy gateway skipped. Caching a default positive delay for
// invalid headers, or accepting Retry-After on 500, fails the second result's primary URL assertion.
test('missing, invalid, and expired Retry-After values leave the gateway available', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: NOW });
    const cases = [
        { label: 'missing', status: 429, header: null },
        { label: 'invalid', status: 503, header: 'not-a-delay' },
        { label: 'zero', status: 429, header: '0' },
        { label: 'negative', status: 503, header: '-10' },
        { label: 'past date', status: 503, header: new Date(NOW - 1_000).toUTCString() },
        { label: 'unrelated status', status: 500, header: '60' }
    ];
    for (const { label, status, header } of cases) {
        await t.test(label, async () => {
            const calls = [];
            let primaryAttempts = 0;
            const { getImageDetails, buildFallbackUrl } = loadImageHelpers(async (url) => {
                calls.push(url);
                if (new URL(url).host === 'public-handles.myfilebase.com' && primaryAttempts++ === 0) {
                    return failureResponse(status, header);
                }
                return imageResponse();
            });
            const request = () => getImageDetails({ imageUrl: 'ipfs://retry-header', useBase64: true });
            assert.deepEqual(await request(), expectedImage(buildFallbackUrl('ipfs://retry-header', 1)));
            assert.deepEqual(await request(), expectedImage(buildFallbackUrl('ipfs://retry-header', 0)));
            assert.deepEqual(calls, [
                buildFallbackUrl('ipfs://retry-header', 0), buildFallbackUrl('ipfs://retry-header', 1),
                buildFallbackUrl('ipfs://retry-header', 0)
            ]);
        });
    }
});

// Feature: NFTCDN cooldown also applies across asset URLs, preserving the original image error.
// Failure: recovery requests ignore rate limits. Removing the recovery isBlocked check makes the
// second request resolve instead of reject; never expiring the block fails the final image result.
test('rate-limited recovery is skipped across assets, then succeeds after expiry', async (t) => {
    t.mock.timers.enable({ apis: ['Date'], now: NOW });
    const gatewayError = new Error('original image unavailable');
    const calls = [];
    let recoveryAttempts = 0;
    const { getImageDetails } = loadImageHelpers(async (url) => {
        calls.push(url);
        if (new URL(url).host === new URL(IMAGE_URL).host) throw gatewayError;
        return recoveryAttempts++ === 0 ? failureResponse(429, '60') : imageResponse();
    });
    const request = (nftcdnUrl) => getImageDetails({ imageUrl: IMAGE_URL, useBase64: true, nftcdnUrl });
    await assert.rejects(request(RECOVERY_URL), (error) => error === gatewayError);
    t.mock.timers.tick(59_999);
    const otherAsset = 'https://recovery.example.test/image?asset=second';
    await assert.rejects(request(otherAsset), (error) => error === gatewayError);
    assert.deepEqual(calls, [IMAGE_URL, RECOVERY_URL, IMAGE_URL]);
    t.mock.timers.tick(1);
    assert.deepEqual(await request(otherAsset), expectedImage(otherAsset));
    assert.deepEqual(calls, [IMAGE_URL, RECOVERY_URL, IMAGE_URL, IMAGE_URL, otherAsset]);
});

// Feature: failed recovery surfaces the original gateway error and a stalled body obeys its budget.
// Failure: recovery replaces the useful error or hangs rendering. Throwing the recovery error fails
// identity assertions; clearing the abort timer before reading the body fails the expiry assertion.
test('HTTP, network, and stalled-body recovery failures preserve the gateway error', async (t) => {
    for (const mode of ['http', 'network', 'stalled body']) {
        await t.test(mode, async (t) => {
            t.mock.timers.enable({ apis: ['setTimeout', 'Date'], now: NOW });
            const gatewayError = new Error('original gateway failure');
            const calls = [];
            const { getImageDetails, NFTCDN_FETCH_TIMEOUT_MS } = loadImageHelpers(async (url, options) => {
                calls.push(url);
                if (url === IMAGE_URL) throw gatewayError;
                if (mode === 'http') return failureResponse(503, null);
                if (mode === 'network') throw new Error('recovery network failure');
                return {
                    ...imageResponse(),
                    arrayBuffer: () => new Promise((_resolve, reject) => {
                        options.signal.addEventListener('abort', () => reject(new Error('recovery body aborted')), { once: true });
                    })
                };
            });
            let settled = false;
            const rejected = assert.rejects(
                getImageDetails({ imageUrl: IMAGE_URL, useBase64: true, nftcdnUrl: RECOVERY_URL }),
                (error) => error === gatewayError
            ).then(() => { settled = true; });
            await flush();
            assert.deepEqual(calls, [IMAGE_URL, RECOVERY_URL]);
            if (mode === 'stalled body') {
                t.mock.timers.tick(NFTCDN_FETCH_TIMEOUT_MS - 1);
                await flush();
                assert.equal(settled, false, 'the recovery body is still pending before its deadline');
                t.mock.timers.tick(1);
                await flush();
                assert.equal(settled, true, 'the recovery body is aborted at its deadline');
            }
            await rejected;
        });
    }
});
