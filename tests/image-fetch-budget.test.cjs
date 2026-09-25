const test = require('node:test');
const assert = require('node:assert/strict');
const Module = require('node:module');

// render.handle.me runs as a 30s function. These tests drive virtual time (mocked setTimeout + Date)
// against gateways that HANG, the way a lapsed IPFS pin behaves, and assert when images resolve.
const imageHelpersPath = require.resolve('../lib/utils/imageHelpers.js');
const handleSvgPath = require.resolve('../lib/HandleSvg.js');
const FN_TIMEOUT_MS = 30_000;
// Fonts, QR, socials and the sharp JPEG encode need the rest of the function's 30s.
const RENDER_HEADROOM_MS = 8_000;

const load = (mockFetch, path) => {
    const originalLoad = Module._load;
    Module._load = function (request) {
        if (request === 'cross-fetch') return mockFetch;
        return originalLoad.apply(this, arguments);
    };
    delete require.cache[imageHelpersPath];
    delete require.cache[handleSvgPath];
    try {
        return require(path);
    } finally {
        Module._load = originalLoad;
    }
};

const flush = () => new Promise((resolve) => setImmediate(resolve));
// Advance virtual time in 100ms steps until the promise settles; report the virtual elapsed time.
const runVirtual = async (t, promise, maxMs = 120_000) => {
    let settled = false, value, error;
    promise.then((v) => { settled = true; value = v; }, (e) => { settled = true; error = e; });
    let elapsed = 0;
    await flush();
    while (!settled && elapsed < maxMs) {
        t.mock.timers.tick(100);
        elapsed += 100;
        await flush();
    }
    return { settled, elapsed, value, error };
};

const hangUntilAborted = (opts) =>
    new Promise((_resolve, reject) => opts.signal.addEventListener('abort', () => reject(new Error('aborted'))));
const image = (type = 'image/png') => ({ ok: true, status: 200, headers: { get: () => type }, arrayBuffer: async () => Buffer.from('img') });
const NFTCDN = 'https://asset1abc.handles.nftcdn.io/image?tk=sig';

// Invariant: when every Kora gateway hangs, NFTCDN is still reached and the image resolves within
// IMAGE_FETCH_BUDGET_MS. Failure mode: 15s per gateway meant Filebase + Pinata used the whole 30s and
// the function was killed before NFTCDN. Negative control: a per-fetch 15s timeout resolves at ~30s.
test('all gateways hang -> NFTCDN recovers the image inside the image budget', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    const calls = [];
    const fetch = (url, opts) => {
        calls.push({ host: new URL(url).host, at: Date.now() });
        return url.includes('nftcdn') ? Promise.resolve(image('image/webp')) : hangUntilAborted(opts);
    };
    const { getImageDetails, IMAGE_FETCH_BUDGET_MS, IPFS_GATEWAY_BUDGET_MS } = load(fetch, imageHelpersPath);
    const r = await runVirtual(t, getImageDetails({ imageUrl: 'ipfs://QmDeadPin', useBase64: true, nftcdnUrl: NFTCDN }));

    assert.equal(r.error, undefined);
    assert.equal(r.value.imageUrl, NFTCDN);
    assert.deepEqual(calls.map((c) => c.host), ['public-handles.myfilebase.com', 'public-handles.mypinata.cloud', 'asset1abc.handles.nftcdn.io']);
    assert.ok(calls[2].at <= IPFS_GATEWAY_BUDGET_MS, `NFTCDN reached at ${calls[2].at}ms`);
    assert.ok(r.elapsed <= IMAGE_FETCH_BUDGET_MS, `resolved at ${r.elapsed}ms`);
    assert.ok(IMAGE_FETCH_BUDGET_MS <= FN_TIMEOUT_MS - RENDER_HEADROOM_MS);
});

// Invariant: a full render whose bg AND pfp gateways all hang finishes its image work early enough
// for the rest of the render to fit in the 30s function. Failure mode: bg then pfp in sequence doubled
// the image time. Negative control: awaiting buildBackgroundImage before buildPfpImage in build() makes
// the elapsed time ~2x the image budget and fails the bound.
test('full build: bg and pfp both hanging still leave render headroom before the 30s timeout', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    const fetch = (url, opts) => (url.includes('nftcdn') ? Promise.resolve(image('image/webp')) : hangUntilAborted(opts));
    const HandleSvg = load(fetch, handleSvgPath).default;
    const svg = new HandleSvg({
        size: 1024,
        handle: 'handle',
        options: { bg_image: 'ipfs://QmDeadBg', pfp_image: 'ipfs://QmDeadPfp' },
        bg_image_nftcdn_url: `${NFTCDN}&bg`,
        pfp_image_nftcdn_url: `${NFTCDN}&pfp`
    });
    svg.buildOG = async () => '';
    svg.buildHandleName = async () => '';
    svg.buildQRCode = async () => '';
    svg.buildSocialsSvg = async () => '';

    const r = await runVirtual(t, svg.build(async () => new Uint8Array(), null, null, {}));

    assert.equal(r.error, undefined);
    assert.ok(r.value.includes('data:image/webp;base64,'), 'both layers come from NFTCDN');
    assert.equal((r.value.match(/data:image\/webp;base64,/g) || []).length >= 2, true);
    assert.ok(r.elapsed <= FN_TIMEOUT_MS - RENDER_HEADROOM_MS, `images resolved at ${r.elapsed}ms`);
});

// Invariant: the timeout covers the body, not just the headers. Failure mode: a gateway that sends
// 200 headers then stalls the body held the render until the function was killed. Negative control:
// clearing the abort timer as soon as fetch() resolves leaves this promise pending forever.
test('a gateway that stalls the body is abandoned for the next tier', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    const hosts = [];
    const fetch = (url, opts) => {
        hosts.push(new URL(url).host);
        if (url.includes('myfilebase')) {
            return Promise.resolve({ ok: true, status: 200, headers: { get: () => 'image/png' }, arrayBuffer: () => hangUntilAborted(opts) });
        }
        return Promise.resolve(image('image/jpeg'));
    };
    const { getImageDetails, IMAGE_FETCH_BUDGET_MS } = load(fetch, imageHelpersPath);
    const r = await runVirtual(t, getImageDetails({ imageUrl: 'ipfs://QmSlowBody', useBase64: true }));

    assert.equal(r.error, undefined);
    assert.equal(r.value.contentType, 'image/jpeg');
    assert.deepEqual(hosts, ['public-handles.myfilebase.com', 'public-handles.mypinata.cloud']);
    assert.ok(r.elapsed <= IMAGE_FETCH_BUDGET_MS);
});

// Invariant: a gateway's Retry-After is honored process-wide. Failure mode (#2113 follow-up): a
// rate-limited gateway was re-called on every render. Negative control: dropping the isBlocked()
// check makes the second render call Pinata again inside the 900s window.
test('a 429 Retry-After gateway is skipped until the stated time, then used again', async (t) => {
    t.mock.timers.enable({ apis: ['setTimeout', 'Date'] });
    const hosts = [];
    const fetch = async (url) => {
        hosts.push(new URL(url).host);
        if (url.includes('myfilebase')) return { ok: false, status: 504, headers: { get: () => null } };
        if (url.includes('mypinata')) return { ok: false, status: 429, headers: { get: (h) => (h.toLowerCase() === 'retry-after' ? '900' : null) } };
        return image('image/webp');
    };
    const { getImageDetails } = load(fetch, imageHelpersPath);
    const req = () => getImageDetails({ imageUrl: 'ipfs://QmRateLimited', useBase64: true, nftcdnUrl: NFTCDN });

    await runVirtual(t, req());
    assert.deepEqual(hosts, ['public-handles.myfilebase.com', 'public-handles.mypinata.cloud', 'asset1abc.handles.nftcdn.io']);

    hosts.length = 0;
    t.mock.timers.tick(899_000);
    const second = await runVirtual(t, req());
    assert.equal(second.value.imageUrl, NFTCDN);
    assert.deepEqual(hosts, ['public-handles.myfilebase.com', 'asset1abc.handles.nftcdn.io'], 'Pinata skipped inside Retry-After');

    hosts.length = 0;
    t.mock.timers.tick(2_000);
    await runVirtual(t, req());
    assert.deepEqual(hosts, ['public-handles.myfilebase.com', 'public-handles.mypinata.cloud', 'asset1abc.handles.nftcdn.io'], 'Pinata used again after Retry-After');
});
