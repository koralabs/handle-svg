const test = require('node:test');
const assert = require('node:assert/strict');

const HandleSvg = require('../lib/HandleSvg.js').default;

const createRenderer = (overrides = {}) =>
    new HandleSvg({
        size: overrides.size ?? 1024,
        handle: overrides.handle ?? 'handle',
        disableDollarSymbol: overrides.disableDollarSymbol,
        options: overrides.options ?? {}
    });

const mockFontResult = (bbox = { x1: 0, y1: -20, x2: 100, y2: 30 }) => ({
    boundingBox: bbox,
    parsedFont: {
        getPath: (text, x, y, fontSize) => ({
            fill: '',
            toSVG() {
                return `<path data-text="${text}" data-x="${x}" data-y="${y}" data-size="${fontSize}" data-fill="${this.fill}" />`;
            }
        })
    }
});

test('HandleSvg builds background, ribbon, border, and contrast-safe logo fragments', () => {
    const renderer = createRenderer({
        size: 2048,
        handle: 'ada',
        options: {
            bg_color: '0xffffff',
            circuit_color: '0xffffff',
            font_color: '0xffffff',
            text_ribbon_colors: ['0xff0000', '0x00ff00', '0x0000ff'],
            text_ribbon_gradient: 'linear-90',
            bg_border_color: '0x123456'
        }
    });

    assert.equal(renderer.buildBackground(), '<rect width="2048" height="2048" fill="#ffffff" />');
    assert.equal(renderer.buildDefaultBackground().includes('fill="#FFFFFF1C"'), true);

    const ribbon = renderer.buildTextRibbon();
    assert.equal(ribbon.includes('linearGradient id="grad1" gradientTransform="rotate(90 0.5 0.5)"'), true);
    assert.equal(ribbon.includes('offset="50%" stop-color="#00ff00"'), true);

    const border = renderer.buildBackgroundBorder();
    assert.equal(border.includes('stroke="#123456"'), true);
    assert.equal(border.includes('stroke-width="30"'), true);

    const logo = renderer.buildLogoHandle();
    assert.equal(logo.includes('x="80" y="80"'), true);
    assert.equal(logo.includes('id="handle" fill="#888888"'), true);
});

test('HandleSvg builds pfp markup with border, zoom, and bounded offsets', () => {
    const renderer = createRenderer({
        size: 2048,
        options: {
            pfp_image: 'ipfs://pfp',
            pfp_border_color: '0x112233',
            pfp_zoom: 150,
            pfp_offset: [100, -100]
        }
    });

    const svg = renderer._buildPfpImageHtmlString('data:image/png;base64,AQID', 1024);

    assert.equal(svg.includes('<clipPath id="circle-path">'), true);
    assert.equal(svg.includes('fill="#112233"'), true);
    assert.equal(svg.includes('height="432" width="432"'), true);
    assert.equal(svg.includes('href="data:image/png;base64,AQID"'), true);

    const invalidRenderer = createRenderer({
        options: {
            pfp_image: 'ipfs://pfp',
            pfp_zoom: 150,
            pfp_offset: [999, 0]
        }
    });

    assert.throws(
        () => invalidRenderer._buildPfpImageHtmlString('data:image/png;base64,AQID'),
        /pfp_offset out of bounds/
    );
});

test('HandleSvg builds QR image fragments for raster and embedded SVG assets', async () => {
    const renderer = createRenderer({ size: 1024 });

    const raster = await renderer.buildQrImage('AQID', 'image/png');
    assert.equal(raster.includes('width="40" height="40"'), true);
    assert.equal(raster.includes('href="data:image/png;base64,AQID"'), true);

    const encodedSvg = Buffer.from('<svg><rect /></svg>', 'utf8').toString('base64');
    const svg = await renderer.buildQrImage(
        encodedSvg,
        'image/svg+xml',
        () => JSON.stringify({ svg: { _attributes: {}, rect: {} } }),
        (obj) => JSON.stringify(obj)
    );
    const parsed = JSON.parse(svg);

    assert.deepEqual(parsed.svg._attributes, {
        width: '40',
        height: '40',
        x: '8.16%',
        y: '8.16%'
    });
});

test('HandleSvg derives QR styling options and positioned view properties', () => {
    const renderer = createRenderer({
        size: 1024,
        options: {
            qr_link: 'https://handle.me/$handle',
            qr_dot: 'dots,#111111',
            qr_inner_eye: 'classy,#222222',
            qr_outer_eye: 'rounded,#333333'
        }
    });

    assert.deepEqual(renderer.buildQrCodeOptions(), {
        width: 215,
        height: 215,
        type: 'svg',
        data: 'https://handle.me/$handle',
        margin: 0,
        dotsOptions: { color: '#111111', type: 'dots' },
        cornersSquareOptions: { color: '#333333', type: 'extra-rounded' },
        cornersDotOptions: { color: '#222222', type: 'classy' },
        backgroundOptions: { color: '#FFFFFF00' }
    });

    assert.deepEqual(renderer.buildQrCodeViewProperties(180), {
        adjustedQRCodeSize: 200,
        qrCodeMargin: 15,
        svgQrPosition: 769,
        svgViewBox: '17.5 17.5 921.5999999999999 921.5999999999999'
    });
});

test('HandleSvg builds handle-name shadow fallback and validates shadow bounds', async () => {
    const renderer = createRenderer({
        size: 2048,
        handle: 'white',
        options: {
            bg_color: '0xffffff',
            font_color: '0xffffff'
        }
    });
    renderer.loadParsedFont = async () => mockFontResult({ x1: 0, y1: -40, x2: 300, y2: 100 });

    const svg = await renderer.buildHandleName(async () => new Uint8Array(), {});

    assert.equal(svg.includes('id="handle_name_white"'), true);
    assert.equal(svg.includes('filter id="drop-shadow"'), true);
    assert.equal(svg.includes('flood-color="#888888"'), true);
    assert.equal(svg.includes('stdDeviation="10"'), true);

    const invalidRenderer = createRenderer({
        options: {
            font_shadow_size: [21, 0, 0]
        }
    });
    invalidRenderer.loadParsedFont = async () => mockFontResult();

    await assert.rejects(
        () => invalidRenderer.buildHandleName(async () => new Uint8Array(), {}),
        /font shadow horizontal offset must be between -20 and 20/
    );
});

test('HandleSvg builds socials with icon and text fragments', async () => {
    const renderer = createRenderer({
        size: 2048,
        options: {
            socials: [{ url: 'https://twitter.com/handle', display: '@handle' }],
            font_color: '0x112233'
        }
    });
    renderer.loadParsedFont = async (_font, _decompress, text) =>
        mockFontResult({ x1: 0, y1: -20, x2: text.length * 20, y2: 44 });

    const svg = await renderer.buildSocialsSvg(async () => new Uint8Array(), {});

    assert.equal(svg.includes('bi-twitter'), true);
    assert.equal(svg.includes('data-text="@handle"'), true);
    assert.equal(svg.includes('data-fill="#112233"'), true);

    const emptyRenderer = createRenderer({ options: { socials: [] } });
    assert.equal(await emptyRenderer.buildSocialsSvg(async () => new Uint8Array(), {}), '');
});

test('HandleSvg full build composes child fragments and honors disabled dollar sign', async () => {
    const renderer = createRenderer({ disableDollarSymbol: true });
    renderer.buildBackgroundImage = async () => '<bg-image />';
    renderer.buildPfpImage = async () => '<pfp-image />';
    renderer.buildOG = async () => '<og />';
    renderer.buildHandleName = async () => '<name />';
    renderer.buildQRCode = async () => '<qr />';
    renderer.buildSocialsSvg = async () => '<socials />';

    const svg = await renderer.build(async () => new Uint8Array(), null, null, {});

    assert.equal(svg.includes('<bg-image />'), true);
    assert.equal(svg.includes('<pfp-image />'), true);
    assert.equal(svg.includes('<og />'), true);
    assert.equal(svg.includes('<name />'), true);
    assert.equal(svg.includes('<qr />'), true);
    assert.equal(svg.includes('<socials />'), true);
    assert.equal(svg.includes('M25.02,8.1'), false);
});
