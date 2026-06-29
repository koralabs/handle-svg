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

test('HandleSvg returns an empty QR image fragment when no asset is provided', async () => {
    const renderer = createRenderer();

    assert.equal(await renderer.buildQrImage(), '');
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

test('HandleSvg builds QR code markup with background, positioning, and embedded image', async () => {
    const renderer = createRenderer({
        size: 1024,
        handle: 'qrhandle',
        options: {
            qr_link: 'https://handle.me/$qrhandle',
            qr_bg_color: '0x010203',
            qr_image: 'ipfs://qr-image'
        }
    });
    renderer.initQrCodeStyling = (QRCodeStyling, options) => ({
        qrCode: new QRCodeStyling(options),
        realQrHeight: 180
    });
    renderer.buildQrImage = async (base64, contentType) => `<qr-image data-base64="${base64}" data-type="${contentType}" />`;

    const OriginalGetImageDetails = require('../lib/utils/imageHelpers.js').getImageDetails;
    const imageHelpers = require('../lib/utils/imageHelpers.js');
    imageHelpers.getImageDetails = async () => ({ contentType: 'image/png', base64: 'AQID' });
    try {
        const svg = await renderer.buildQRCode(
            function MockJSDOM() {
                this.window = { document: {}, XMLSerializer: function XMLSerializer() {} };
            },
            class MockQRCodeStyling {
                constructor(options) {
                    this.options = options;
                    this._svg = { _element: { outerHTML: '<svg class="qr-core"></svg>' } };
                }
            }
        );

        assert.equal(svg.includes('style="fill: #010203"'), true);
        assert.equal(svg.includes('id="qr_code_qrhandle"'), true);
        assert.equal(svg.includes('x="776.5" y="776.5"'), true);
        assert.equal(svg.includes('viewBox="17.5 17.5 921.5999999999999 921.5999999999999"'), true);
        assert.equal(svg.includes('<svg class="qr-core"></svg>'), true);
        assert.equal(svg.includes('<qr-image data-base64="AQID" data-type="image/png" />'), true);
    } finally {
        imageHelpers.getImageDetails = OriginalGetImageDetails;
    }
});

test('HandleSvg skips QR image failures but still renders QR code markup', async () => {
    const renderer = createRenderer({
        handle: 'qrhandle',
        options: {
            qr_link: 'https://handle.me/$qrhandle',
            qr_image: 'ipfs://missing-qr-image'
        }
    });
    renderer.initQrCodeStyling = () => ({
        qrCode: { _svg: { _element: { outerHTML: '<svg class="qr-core"></svg>' } } },
        realQrHeight: 180
    });
    renderer.buildQrImage = async () => {
        throw new Error('should not be called when image details fail');
    };

    const OriginalGetImageDetails = require('../lib/utils/imageHelpers.js').getImageDetails;
    const imageHelpers = require('../lib/utils/imageHelpers.js');
    imageHelpers.getImageDetails = async () => {
        throw new Error('unreachable image');
    };
    const originalLog = console.log;
    console.log = () => {};
    try {
        const svg = await renderer.buildQRCode(null, class MockQRCodeStyling {});

        assert.equal(svg.includes('id="qr_code_qrhandle"'), true);
        assert.equal(svg.includes('<svg class="qr-core"></svg>'), true);
        assert.equal(svg.includes('<qr-image'), false);
    } finally {
        console.log = originalLog;
        imageHelpers.getImageDetails = OriginalGetImageDetails;
    }
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

test('HandleSvg renders social icons with contrast fallback against solid backgrounds', () => {
    const renderer = createRenderer({
        size: 2048,
        options: {
            bg_color: '0xffffff',
            font_color: '0xffffff'
        }
    });

    const icon = renderer.renderSocialIcon('https://example.com/profile', 10, 20);

    assert.equal(icon.includes('class="bi bi-globe2"'), true);
    assert.equal(icon.includes('x="10" y="20"'), true);
    assert.equal(icon.includes('fill="#888888"'), true);
    assert.equal(icon.includes('scale(3)'), true);
});


test('HandleSvg covers direct image sizing, ribbon fallback, OG, and dollar rarity fragments', async () => {
    let renderer = createRenderer({ size: 1200, options: { bg_image: 'ipfs://bg' } });
    assert.equal(
        renderer._buildBackgroundImageHtmlString('data:image/png;base64,AQID', 600),
        '<image href="data:image/png;base64,AQID" height="600" width="600" />'
    );

    renderer = createRenderer({
        size: 2048,
        options: {
            text_ribbon_colors: ['0x123456'],
            text_ribbon_gradient: 'linear-45'
        }
    });
    const solidRibbon = renderer.buildTextRibbon();
    assert.equal(solidRibbon.includes('style="fill: #123456"'), true);
    assert.equal(solidRibbon.includes('linearGradient'), false);

    renderer = createRenderer({ size: 2048, handle: 'aa', options: {} });
    const dollar = renderer.buildDollarSign();
    assert.equal(dollar.includes('fill="#593292"'), true);
    assert.equal(dollar.includes('x="1668" y="80"'), true);

    renderer = createRenderer({
        size: 2048,
        handle: 'oggy',
        options: {
            og_number: 42,
            font_color: '0xabcdef'
        }
    });
    renderer.loadParsedFont = async (_font, _decompress, text, fontSize) =>
        mockFontResult({ x1: 0, y1: -10, x2: text.length * 12, y2: 30 });

    const og = await renderer.buildOG(async () => new Uint8Array(), {});
    assert.equal(og.includes('data-text="OG 42/2438"'), true);
    assert.equal(og.includes('data-x="964"'), true);
    assert.equal(og.includes('data-y="120"'), true);
    assert.equal(og.includes('data-fill="#abcdef"'), true);
});

test('HandleSvg builds centered logo-only handle name markup', async () => {
    const renderer = createRenderer({
        size: 2048,
        handle: 'hi',
        options: { font_color: '0x445566' }
    });
    renderer.loadParsedFont = async (_font, _decompress, text, fontSize) =>
        text === '00'
            ? mockFontResult({ x1: 0, y1: -80, x2: 180, y2: 20 })
            : mockFontResult({ x1: -10, y1: -50, x2: 150, y2: 30 });

    const svg = await renderer.buildLogoAndHandleName(async () => new Uint8Array(), {});

    assert.equal(svg.includes('id="handle_name_hi"'), true);
    assert.equal(svg.includes('width="2048" height="682.6666666666666"'), true);
    assert.equal(svg.includes('id="S" fill="#0cd15b"'), true);
    assert.equal(svg.includes('data-text="hi"'), true);
    assert.equal(svg.includes('data-fill="#445566"'), true);
    assert.equal(svg.includes('scale(2.3157894736842106)'), true);
});

test('HandleSvg wraps logo-only handle markup in a transparent SVG shell', async () => {
    const renderer = createRenderer({ size: 1200 });
    renderer.buildLogoAndHandleName = async () => '<logo-name />';

    const svg = await renderer.buildLogoHandleSvg(async () => new Uint8Array(), {});

    assert.equal(svg.includes('width="1200" height="400"'), true);
    assert.equal(svg.includes('style="background: transparent"'), true);
    assert.equal(svg.includes('<logo-name />'), true);
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
