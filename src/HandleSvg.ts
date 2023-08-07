import { IHandleSvg } from './interfaces/IHandleSvg';
import { IPFS_GATEWAY, OG_TOTAL } from './utils/constants';
import { getFontDetails, getFontSize, getRarityFromLength, getRarityHex, hexToColorHex } from './utils';
import opentype from 'opentype.js';
import { HexString, HexStringOrEmpty, IHandleSvgOptions, SocialItem } from '@koralabs/handles-public-api-interfaces';
import { getSocialIcon } from './utils/getSocialIcon';
import { checkContrast } from './utils/checkContrast';
import { getFontArrayBuffer } from './utils/getFontArrayBuffer';

export default class HandleSvg {
    private _options: IHandleSvgOptions;
    private _params: { size: number; handle: string; disableDollarSymbol: boolean };
    private _baseMargin: number = 80;
    private _baseSize: number = 2048;
    private _qrCodeBaseSize: number = 430;
    private _margin: number;
    private _defaultContrastColor: string = '#888888';

    constructor(inputs: IHandleSvg) {
        this._options = inputs.options;
        this._params = {
            size: inputs.size,
            handle: inputs.handle,
            disableDollarSymbol: inputs.disableDollarSymbol ?? false
        };
        this._margin = inputs.size * (this._baseMargin / this._baseSize);
    }

    buildLogoHandle() {
        const { size } = this._params;
        const { bg_color, bg_image } = this._options;
        const x = this._margin;
        const y = this._margin;
        const scale = (size / this._baseSize) * 4;

        let dollarFill = '#0cd15b';
        let handleTextFill = '#ffffff';

        if (!bg_image && bg_color) {
            // verify handle text is visible
            const validBgColor = checkContrast(hexToColorHex(bg_color), handleTextFill, 1.1);
            if (!validBgColor) {
                handleTextFill = this._defaultContrastColor;
            }

            // verify dollar sign is visible
            const validDollarColor = checkContrast(hexToColorHex(bg_color), dollarFill, 1.05);
            if (!validDollarColor) {
                dollarFill = this._defaultContrastColor;
            }
        }

        return `
            <svg xmlns="http://www.w3.org/2000/svg" x="${x}" y="${y}">
                <path transform="scale(${scale})" id="S" fill="${dollarFill}" d="M3.48,1.16c0-.28,.21-.54,.64-.78,.43-.25,.99-.38,1.7-.38,.54,0,.89,.12,1.05,.36,.11,.17,.17,.33,.17,.47v.54c1.28,.14,2.16,.4,2.66,.76,.2,.14,.31,.28,.31,.42,0,.63-.14,1.3-.42,2.02-.27,.72-.54,1.08-.8,1.08-.05,0-.19-.05-.44-.16-.75-.35-1.37-.52-1.86-.52s-.82,.05-1,.14c-.17,.1-.25,.25-.25,.45,0,.19,.12,.34,.37,.45,.25,.11,.55,.2,.92,.29,.37,.07,.77,.2,1.2,.38,.44,.18,.85,.4,1.22,.65,.37,.25,.68,.63,.93,1.14,.25,.49,.37,1,.37,1.52s-.05,.95-.14,1.28c-.09,.34-.25,.69-.47,1.05-.21,.36-.55,.69-1,.98-.44,.28-.97,.48-1.59,.61v.29c0,.28-.21,.54-.64,.78-.43,.25-.99,.38-1.7,.38-.54,0-.89-.12-1.05-.36-.11-.17-.17-.33-.17-.47v-.54c-.73-.07-1.37-.19-1.92-.34-1.04-.3-1.56-.63-1.56-.98,0-.67,.09-1.37,.27-2.1,.18-.73,.4-1.1,.64-1.1,.05,0,.51,.16,1.41,.49s1.57,.49,2.02,.49,.75-.05,.88-.14c.14-.11,.2-.26,.2-.45s-.12-.36-.37-.49c-.25-.14-.56-.26-.93-.34-.37-.08-.78-.22-1.22-.4-.43-.18-.83-.39-1.2-.63-.37-.24-.68-.6-.93-1.07-.25-.47-.37-1.02-.37-1.64C.39,3.06,1.42,1.76,3.48,1.39v-.23Z" />
                <path transform="scale(${scale})" id="handle" fill="${handleTextFill}" d="M66.45,6.38c-.49,0-.91,.16-1.24,.48-.32,.32-.51,.82-.57,1.5h3.6c-.01-.58-.16-1.05-.45-1.42-.29-.38-.74-.57-1.35-.57Zm-.02-1.83c1.3,0,2.33,.37,3.09,1.12,.76,.74,1.14,1.79,1.14,3.16v1.24h-6.07c.02,.73,.24,1.3,.64,1.71,.41,.41,.98,.62,1.71,.62,.61,0,1.16-.06,1.66-.17,.49-.13,1.01-.32,1.53-.57v1.99c-.46,.23-.95,.4-1.47,.5-.51,.12-1.12,.17-1.85,.17-.94,0-1.78-.17-2.5-.52-.72-.36-1.29-.89-1.71-1.61-.41-.71-.62-1.61-.62-2.7s.18-2.02,.55-2.75c.38-.74,.9-1.29,1.57-1.66s1.44-.55,2.33-.55Zm-6.56,9.61h-2.57V1.02h2.57V14.16Zm-9.6-1.88c.71,0,1.21-.21,1.5-.62,.29-.43,.44-1.06,.45-1.9v-.28c0-.92-.14-1.63-.43-2.11-.28-.48-.79-.73-1.55-.73-.56,0-1.01,.25-1.33,.74-.32,.48-.48,1.19-.48,2.11s.16,1.62,.48,2.09c.32,.46,.78,.69,1.36,.69Zm-.9,2.06c-1.05,0-1.9-.41-2.57-1.23-.66-.83-.98-2.05-.98-3.65s.33-2.84,1-3.67,1.54-1.24,2.62-1.24c.68,0,1.24,.13,1.67,.4s.78,.59,1.03,.99h.09c-.03-.18-.07-.45-.12-.8-.05-.36-.07-.72-.07-1.09V1.02h2.57V14.16h-1.97l-.5-1.23h-.1c-.25,.39-.59,.73-1.02,1-.43,.27-.98,.4-1.66,.4Zm-8.97-9.79c1.01,0,1.82,.28,2.43,.83,.61,.54,.91,1.42,.91,2.63v6.15h-2.57v-5.51c0-.68-.12-1.19-.36-1.52-.24-.35-.63-.52-1.16-.52-.78,0-1.32,.27-1.6,.81-.29,.53-.43,1.3-.43,2.3v4.44h-2.57V4.72h1.97l.34,1.21h.14c.3-.48,.71-.84,1.22-1.05,.53-.22,1.09-.33,1.67-.33Zm-11.53,5.27c-.83,.02-1.4,.17-1.72,.45-.32,.28-.48,.64-.48,1.09,0,.39,.11,.67,.34,.85,.23,.16,.53,.24,.9,.24,.55,0,1.02-.16,1.4-.48,.38-.33,.57-.8,.57-1.4v-.78l-1,.03Zm-.36-5.29c1.26,0,2.23,.28,2.9,.83,.68,.54,1.02,1.38,1.02,2.51v6.29h-1.79l-.5-1.28h-.07c-.4,.51-.83,.88-1.28,1.11s-1.06,.35-1.85,.35c-.84,0-1.53-.24-2.09-.73-.55-.5-.83-1.25-.83-2.26s.35-1.74,1.05-2.21c.7-.48,1.75-.75,3.16-.8l1.64-.05v-.41c0-.5-.13-.86-.4-1.09-.25-.23-.61-.35-1.07-.35s-.91,.07-1.35,.21c-.44,.13-.87,.29-1.31,.48l-.84-1.75c.51-.27,1.06-.47,1.67-.62,.62-.15,1.26-.22,1.93-.22Zm-12.63-.83c0,.46-.02,.9-.05,1.33-.02,.43-.05,.73-.07,.9h.14c.3-.48,.68-.84,1.16-1.05,.47-.22,.99-.33,1.57-.33,1.02,0,1.84,.28,2.45,.83,.62,.54,.93,1.42,.93,2.63v6.15h-2.57v-5.51c0-1.36-.51-2.04-1.52-2.04-.77,0-1.3,.27-1.6,.81-.29,.53-.43,1.3-.43,2.3v4.44h-2.57V1.02h2.57V3.7Z" />
            </svg>
        `;
    }

    buildBackground() {
        const { size } = this._params;
        const { bg_color } = this._options;
        return `<rect width="${size}" height="${size}" fill="${
            bg_color && bg_color.startsWith('0x') ? hexToColorHex(bg_color) : '#0d0f26ff'
        }" />`;
    }

    buildDefaultBackground() {
        const { size } = this._params;
        return `
            <svg width="${size}" height="${size}" viewBox="40 -30 445 455" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g opacity="0.1">
                    <path fill="#fff" d="M96.2544 146.823L157.873 213.465L281.926 213.465C286.195 220.383 293.825 225.008 302.548 225.008C315.931 225.008 326.771 214.163 326.771 200.794C326.771 187.399 315.931 176.554 302.548 176.554C293.816 176.554 286.182 181.187 281.918 188.123L168.961 188.123L107.342 121.481L-32.9954 121.481L-32.9955 146.823L96.2544 146.823V146.823Z" />
                    <path fill="#fff" d="M126.103 392.422L150.282 343.699L190.537 343.699C194.801 350.614 202.427 355.233 211.146 355.233C224.524 355.233 235.369 344.398 235.369 331.028C235.369 317.633 224.524 306.789 211.146 306.789C202.418 306.789 194.788 311.421 190.524 318.358L134.57 318.358L110.391 367.08L-32.9998 367.08L-32.9998 392.422L126.103 392.422Z" />
                    <path fill="#fff" d="M140.253 82.0023L209.923 36.9192L320.16 36.9192C324.428 43.8337 332.054 48.4622 340.778 48.4622C354.16 48.4622 365 37.609 365 24.2485C365 10.8446 354.16 5.59706e-05 340.778 5.42576e-05C332.041 5.31393e-05 324.411 4.63708 320.147 11.5776L202.449 11.5776L132.779 56.6606L-32.9955 56.6606L-32.9955 82.0022L140.253 82.0023Z" />
                    <path fill="#fff" d="M122.394 274.372C126.658 281.282 134.28 285.906 143.003 285.906C156.381 285.906 167.225 275.062 167.225 261.701C167.225 248.297 156.381 237.479 143.003 237.479C134.271 237.479 126.645 242.103 122.381 249.031L-33 249.03L-33 274.372L122.394 274.372Z" />
                </g>
            </svg>
        `;
    }

    buildBackgroundImage = () => {
        const { size } = this._params;
        const { bg_image } = this._options;

        if (bg_image && bg_image != '') {
            const image = bg_image.startsWith('ipfs://')
                ? `${IPFS_GATEWAY}/${bg_image.replace('ipfs://', '')}`
                : bg_image;
            return `<image href="${image}" height="${size}" width="${size}" />`;
        }

        return '';
    };

    buildPfpImage() {
        const { size } = this._params;
        const { pfp_image, pfp_zoom, pfp_offset, pfp_border_color } = this._options;

        if (!pfp_image || pfp_image === '') return '';

        const basePfpCircleSize = pfp_border_color ? 576 : 636;
        const pfpCircleSize = size * (basePfpCircleSize / this._baseSize);
        let pfpImageSize = parseInt(`${pfpCircleSize}`);

        // add zoom if it exists
        if (pfp_zoom) {
            if (pfp_zoom > 1) {
                pfpImageSize = pfpCircleSize * (pfp_zoom / 100);
            }
        }

        const dx = size / 2;
        const dy = size * (493 / this._baseSize);
        const radius = pfpCircleSize / 2;

        const strokeWidth = size * (30 / this._baseSize);

        let pfpImageX = parseInt(`${dx}`) - radius;
        let pfpImageY = parseInt(`${dy}`) - radius;

        if (pfp_offset) {
            const [x, y] = pfp_offset;
            pfpImageX += size * (x / this._baseSize);
            pfpImageY += size * (y / this._baseSize);
        }

        const image = pfp_image.startsWith('ipfs://')
            ? `${IPFS_GATEWAY}/${pfp_image.replace('ipfs://', '')}`
            : pfp_image;

        return `<svg>
                    <defs>
                        <clipPath id="circle-path">
                            <circle cx="${dx}" cy="${dy}" r="${radius}" />
                        </clipPath>
                    </defs>
                    ${
                        pfp_border_color && pfp_border_color.startsWith('0x')
                            ? `<circle cx="${dx}" cy="${dy}" r="${radius + strokeWidth}" fill="${hexToColorHex(
                                  pfp_border_color
                              )}" />`
                            : ''
                    }
                    <image clip-path="url(#circle-path)" height="${pfpImageSize}" width="${pfpImageSize}" x="${pfpImageX}" y="${pfpImageY}" href="${image}" />
                </svg>`;
    }

    buildTextRibbon = () => {
        const getGradientStops = (colors: HexStringOrEmpty[]) => {
            const stops = [];
            for (let i = 0; i < colors.length; i++) {
                const color = colors[i];
                if (color && color.startsWith('0x')) {
                    stops.push(
                        `<stop offset="${(i / (colors.length - 1)) * 100}%" stop-color="${hexToColorHex(color)}" />`
                    );
                }
            }
            return stops.join('');
        };

        const { size } = this._params;
        const { text_ribbon_colors, text_ribbon_gradient } = this._options;
        const height = size * (314 / this._baseSize);
        const x = 0;

        const yOffset = size * (9 / this._baseSize);
        const y = size / 2 - height / 2 + yOffset;

        if (text_ribbon_colors && text_ribbon_colors.length > 0) {
            const [firstColor] = text_ribbon_colors;
            // check if gradient is enabled
            if (text_ribbon_gradient && text_ribbon_gradient !== 'none' && text_ribbon_colors.length > 1) {
                return `
                <svg>
                    <defs>
                        ${
                            text_ribbon_gradient.startsWith('linear')
                                ? `<linearGradient id="grad1" gradientTransform="rotate(${
                                      text_ribbon_gradient.split('-')[1]
                                  } 0.5 0.5)">${getGradientStops(text_ribbon_colors)}</linearGradient>`
                                : `<radialGradient id="grad1">${getGradientStops(text_ribbon_colors)}</radialGradient>`
                        }
                    </defs>
                    <rect x="${x}" y="${y}" width="${size}" height="${height}" style="fill: url(#grad1)" />
                </svg>
                `;
            }

            return `
                <svg>
                    <rect x="0" y="${size / 2 - height / 2}" width="${size}" height="${height}" style="fill: ${
                firstColor && firstColor.startsWith('0x') ? hexToColorHex(firstColor) : '#fff'
            }" />
                </svg>
            `;
        }

        return '';
    };

    buildBackgroundBorder = () => {
        const { size } = this._params;
        const { bg_border_color } = this._options;
        const strokeWidth = size * (30 / this._baseSize);
        const recSize = size - strokeWidth;
        return bg_border_color && bg_border_color.startsWith('0x')
            ? `<rect x="${strokeWidth / 2}" y="${
                  strokeWidth / 2
              }" width="${recSize}" height="${recSize}" fill="none" stroke-width="${strokeWidth}" stroke="${hexToColorHex(
                  bg_border_color
              )}" />`
            : '';
    };

    buildDollarSign = () => {
        const { size, handle } = this._params;
        const { bg_image, bg_color } = this._options;
        const dollarSignWidth = size * (300 / this._baseSize);
        const x = size - dollarSignWidth - this._margin;
        const y = this._margin;
        const scale = (size / this._baseSize) * 4;

        let dollarFill = getRarityHex(handle);

        if (!bg_image && bg_color) {
            // verify dollar sign is visible
            const validDollarColor = checkContrast(hexToColorHex(bg_color), dollarFill, 1.1);
            if (!validDollarColor) {
                dollarFill = this._defaultContrastColor;
            }
        }

        return `<svg x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
                    <path fill="${dollarFill}" transform="scale(${scale})" d="M25.02,8.1c0-1.94,1.55-3.75,4.64-5.44,3.09-1.77,7.16-2.66,12.21-2.66,3.91,0,6.43,.84,7.57,2.53,.81,1.18,1.22,2.28,1.22,3.29v3.79c9.2,1.01,15.58,2.78,19.16,5.31,1.46,1.01,2.2,1.98,2.2,2.91,0,4.39-1.02,9.11-3.05,14.17-1.95,5.06-3.87,7.59-5.74,7.59-.33,0-1.38-.38-3.17-1.14-5.37-2.45-9.85-3.67-13.43-3.67s-5.9,.34-7.2,1.01c-1.22,.67-1.83,1.73-1.83,3.16,0,1.35,.9,2.4,2.69,3.16,1.79,.76,3.99,1.43,6.59,2.02,2.69,.51,5.57,1.39,8.67,2.66,3.17,1.26,6.1,2.78,8.79,4.55,2.69,1.77,4.92,4.43,6.71,7.97,1.79,3.46,2.69,7,2.69,10.63s-.33,6.62-.98,8.98-1.79,4.81-3.42,7.34c-1.55,2.53-3.95,4.81-7.2,6.83-3.17,1.94-7,3.37-11.47,4.3v2.02c0,1.94-1.55,3.75-4.64,5.44-3.09,1.77-7.16,2.66-12.21,2.66-3.91,0-6.43-.84-7.57-2.53-.81-1.18-1.22-2.28-1.22-3.29v-3.79c-5.29-.51-9.89-1.31-13.79-2.4-7.49-2.11-11.23-4.39-11.23-6.83,0-4.72,.65-9.61,1.95-14.67,1.3-5.14,2.85-7.72,4.64-7.72,.33,0,3.7,1.14,10.13,3.42,6.43,2.28,11.27,3.42,14.53,3.42s5.37-.34,6.35-1.01c.98-.76,1.46-1.81,1.46-3.16s-.9-2.49-2.69-3.42c-1.79-1.01-4.03-1.81-6.71-2.4-2.69-.59-5.61-1.52-8.79-2.78-3.09-1.26-5.98-2.74-8.67-4.43-2.69-1.69-4.92-4.17-6.71-7.46-1.79-3.29-2.69-7.13-2.69-11.51,0-15.52,7.41-24.58,22.22-27.2v-1.64Z" />
                </svg>`;
    };

    buildOG = () => {
        const { size, handle } = this._params;
        const { font, og_number } = this._options;

        if (!og_number) {
            return '';
        }

        const { fontFamily, fontCss } = getFontDetails(font);

        const fontSize = size * (48 / this._baseSize);
        const fontWeight = '700';
        const dollarSignWidth = size * (300 / this._baseSize);
        const x = size - dollarSignWidth - this._margin;
        const y = size * (560 / this._baseSize);
        return `<svg x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <style type="text/css">
                ${fontCss}
            </style>
        </defs>
        <text transform="translate(${dollarSignWidth / 2})"
        ><tspan dominant-baseline="hanging"
        text-anchor="middle"
        fill="${getRarityHex(handle)}"
        font-size="${fontSize}"
        font-family="${fontFamily}"
        font-weight="${fontWeight}">OG ${og_number}/${OG_TOTAL}</tspan></text>
    </svg>`;
    };

    async buildHandleName(decompress: (src: Uint8Array | Buffer) => Promise<Uint8Array>) {
        let { size, handle } = this._params;

        let {
            bg_color,
            bg_image,
            text_ribbon_colors,
            font_color,
            font_shadow_color,
            font,
            font_shadow_size = []
        } = this._options;

        let baseFontSize = 200; //getFontSize(handle);
        let { fontFamily, fontCss, fontLink } = getFontDetails(font);
        const fontSize = size * (baseFontSize / this._baseSize);

        let parsedFont: any;
        try {
            const fontArrayBuffer = await getFontArrayBuffer(fontLink, decompress);
            parsedFont = opentype.parse(fontArrayBuffer);
        } catch (error) {
            ({ fontFamily, fontCss, fontLink } = getFontDetails());
            const fontArrayBuffer = await getFontArrayBuffer(fontLink, decompress);
            parsedFont = opentype.parse(fontArrayBuffer);
        }

        const bb = parsedFont.getPath(handle, 0, 0, fontSize).getBoundingBox();
        const fontWeight = 700;

        // - font color (from creator default)
        // - font shadow color
        // - font shadow size blur needs to be above
        // - background color
        // - text ribbon

        let fontFill = font_color && font_color.startsWith('0x') ? hexToColorHex(font_color) : '#ffffff';
        let fontShadowFill = font_shadow_color;

        if (!bg_image && text_ribbon_colors?.length === 1) {
            const validTextRibbon = checkContrast(hexToColorHex(text_ribbon_colors[0] as HexString), fontFill);
            if (!validTextRibbon) {
                fontShadowFill = `0x${this._defaultContrastColor.replace('#', '')}`;
                font_shadow_size = [0, 0, 8];
            }
        } else if (!bg_image && bg_color) {
            const validBgColor = checkContrast(hexToColorHex(bg_color), fontFill);
            if (!validBgColor) {
                fontShadowFill = `0x${this._defaultContrastColor.replace('#', '')}`;
                font_shadow_size = [0, 0, 8];
            }
        }

        let [fontShadowHorzOffset = 8, fontShadowVertOffset = 8, fontShadowBlur = 8] = font_shadow_size;

        const horizontalOffset = size * (fontShadowHorzOffset / this._baseSize);
        const verticalOffset = size * (fontShadowVertOffset / this._baseSize);
        let blur = size * (fontShadowBlur / this._baseSize);

        const midpoint = size / 2;
        const fontBaseline = size * (60 / this._baseSize) + midpoint;
        const offset = midpoint - (fontBaseline + bb.y2 - (bb.y2 - bb.y1) / 2);

        const fontMarginX = size * (200 / this._baseSize);
        const fontMarginY = size * (this._baseMargin / this._baseSize);
        const ribbonHeight = size * (314 / this._baseSize);
        const maxFontWidth = size - fontMarginX;
        const maxFontHeight = ribbonHeight - fontMarginY;

        const realFontHeight = bb.y2 - bb.y1;
        const realFontWidth = bb.x2 - bb.x1;
        let zoomPercent = (maxFontWidth - realFontWidth) / realFontWidth;
        if (realFontHeight / maxFontHeight > realFontWidth / maxFontWidth) {
            zoomPercent = (maxFontHeight - realFontHeight) / realFontHeight;
        }
        zoomPercent = 1 + zoomPercent;

        const viewBoxWidth = size / zoomPercent;
        const viewBoxHeight = size / zoomPercent;

        const half = '50%';
        const viewBox = `0 ${offset * -1} ${viewBoxWidth} ${viewBoxHeight}`;

        return fontShadowFill && fontShadowFill.startsWith('0x')
            ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
                    <defs>
                        <style type="text/css">
                            ${fontCss}
                        </style>
                    </defs>
                    <text style="text-shadow: ${horizontalOffset}px ${verticalOffset}px ${blur}px ${fontShadowFill.replace(
                  '0x',
                  '#'
              )};" x="${half}" y="${half}" dominant-baseline="central" fill="${fontFill}" font-size="${fontSize}" font-family="${fontFamily}" font-weight="${fontWeight}" text-anchor="middle">${handle}</text>
                </svg>`
            : `<svg id="handle_name_${handle}" xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">
                    <defs>
                        <style type="text/css">
                            ${fontCss}
                        </style>
                    </defs>
                    <text x="${half}" y="${half}" dominant-baseline="central" fill="${fontFill}" font-size="${fontSize}" font-family="${fontFamily}" font-weight="${fontWeight}" text-anchor="middle">${handle}</text>
                </svg>`;
    }

    buildQRCode = async (jsdom: any, QRCodeStyling: any) => {
        const { handle } = this._params;
        const { qr_link, qr_bg_color } = this._options;

        const options = this.buildQrCodeOptions();

        if (!options) {
            return '';
        }

        if (jsdom) {
            require('node-self');
            global.window = new jsdom().window as any;
            global.self = global.window;
            global.document = global.window.document;
            global.XMLSerializer = global.window.XMLSerializer;

            options.jsdom = jsdom;
        }

        const { qrCode, realQrHeight } = this.initQrCodeStyling<any>(QRCodeStyling, options);

        const { adjustedQRCodeSize, qrCodeMargin, svgQrPosition, svgViewBox } =
            this.buildQrCodeViewProperties(realQrHeight);
        if (qr_link) {
            return `
                <rect x="${svgQrPosition}" y="${svgQrPosition}" width="${adjustedQRCodeSize + qrCodeMargin}" height="${
                adjustedQRCodeSize + qrCodeMargin
            }" 
                    style="fill: ${
                        qr_bg_color && qr_bg_color.startsWith('0x') ? hexToColorHex(qr_bg_color) : '#ffffff00'
                    }" 
                />
                <svg id="qr_code_${handle}" x="${svgQrPosition + qrCodeMargin / 2}" y="${
                svgQrPosition + qrCodeMargin / 2
            }" viewBox="${svgViewBox}">${qrCode._svg?._element.outerHTML}</svg>
            `;
        }

        return '';
    };

    renderSocialIcon(socialUrl: string) {
        const { size } = this._params;
        const { font_color, bg_image, bg_color } = this._options;

        const scale = size * (3 / this._baseSize);
        let fontColor = font_color && font_color.startsWith('0x') ? hexToColorHex(font_color) : '#ffffff';

        if (!bg_image && bg_color) {
            const validBgColor = checkContrast(hexToColorHex(bg_color), fontColor);
            if (!validBgColor) {
                fontColor = this._defaultContrastColor;
            }
        }

        return getSocialIcon(socialUrl, scale, fontColor);
    }

    buildSocialsSvg(widthForShadow?: number) {
        const { size } = this._params;
        const { socials, font, font_color, bg_image, bg_color } = this._options;
        const { fontFamily, fontCss } = getFontDetails(font);
        const socialSize = size * (48 / this._baseSize);
        const fontSize = size * (64 / this._baseSize);
        const fontWeight = '700';
        const socialSpacing = size * (80 / this._baseSize);
        const x = this._margin;
        const y = size - socialSize - this._margin;

        let fontColor = font_color && font_color.startsWith('0x') ? hexToColorHex(font_color) : '#ffffff';
        let fontShadowFill: string | undefined;
        let fontShadowSize: number[];

        if (!bg_image && bg_color) {
            const validBgColor = checkContrast(hexToColorHex(bg_color), fontColor);
            if (!validBgColor) {
                fontShadowFill = `0x${this._defaultContrastColor.replace('#', '')}`;
                const blur = (widthForShadow ?? size) * (8 / this._baseSize);
                fontShadowSize = [0, 0, blur];
            }
        }

        return socials && socials.length > 0
            ? socials.map((social: SocialItem, index: number) => {
                  return `<svg xmlns="http://www.w3.org/2000/svg" x="${x}" y="${y - index * socialSpacing}">
                                ${this.renderSocialIcon(social.url)}
                                <defs>
                                    <style type="text/css">
                                        ${fontCss}
                                    </style>
                                </defs>
                                <text
                                    ${
                                        fontShadowFill
                                            ? `style="text-shadow: ${fontShadowSize[0]}px ${fontShadowSize[1]}px ${
                                                  fontShadowSize[2]
                                              }px ${fontShadowFill.replace('0x', '#')};"`
                                            : ''
                                    }
                                    x="${socialSize + socialSize / 3}"
                                    dominant-baseline="hanging"
                                    fill="${fontColor}"
                                    font-size="${fontSize}"
                                    font-family="${fontFamily}"
                                    font-weight="${fontWeight}"
                                >
                                    ${social.display}
                                </text>
                            </svg>`;
              })
            : undefined;
    }

    async build(decompress: any, jsdom: any, QRCodeStyling: any) {
        const { size, disableDollarSymbol } = this._params;

        return `
            <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
                ${this.buildBackground()}
                ${this.buildDefaultBackground()}
                ${this.buildBackgroundImage()}
                ${this.buildPfpImage()}
                ${this.buildTextRibbon()}
                ${this.buildBackgroundBorder()}
                ${this.buildLogoHandle()}
                ${disableDollarSymbol ? '' : this.buildDollarSign()}
                ${this.buildOG()}
                ${await this.buildHandleName(decompress)}
                ${await this.buildQRCode(jsdom, QRCodeStyling)}
                ${this.buildSocialsSvg()}
            </svg>
        `;
    }

    initQrCodeStyling<T>(QRCodeStyling: any, options: any): { qrCode: T; realQrHeight: number } {
        const qrCode = new QRCodeStyling(options);

        // if (qrCode?._svgDrawingPromise) {
        //     await qrCode._svgDrawingPromise;
        // }

        const eyeX = qrCode._svg?._element.children[3]?.attributes?.getNamedItem('x')?.value;
        const eyeY = qrCode._svg?._element.children[7]?.attributes?.getNamedItem('y')?.value;
        const eyeHeight = qrCode._svg?._element.children[7]?.attributes?.getNamedItem('height')?.value;

        const realQrHeight = eyeY && eyeX && eyeHeight ? parseInt(eyeY) - parseInt(eyeX) + parseInt(eyeHeight) : 0;

        return {
            qrCode,
            realQrHeight
        };
    }

    buildQrCodeOptions(): any {
        const { size } = this._params;
        const { qr_dot, qr_inner_eye, qr_outer_eye, qr_link } = this._options;

        // Disable QR image for now until we can figure out how to fix it.
        const qr_image = '';

        if (!qr_link) return undefined;

        const [dotType, dotColor] = qr_dot?.split(',') ?? ['square', '#000000'];
        const [innerEyeType, innerEyeColor] = qr_inner_eye?.split(',') ?? ['square', '#000000'];
        const [outerEyeType, outerEyeColor] = qr_outer_eye?.split(',') ?? ['square', '#000000'];

        const qrCodeSize = size * (this._qrCodeBaseSize / this._baseSize);
        const imageMargin = size * (8 / this._baseSize);

        return {
            width: qrCodeSize,
            height: qrCodeSize,
            type: 'svg',
            image: qr_image,
            imageOptions: {
                margin: imageMargin,
                hideBackgroundDots: false
            },
            data: qr_link,
            margin: 0,
            dotsOptions: {
                color: dotColor || '#000000',
                type: dotType
            },
            cornersSquareOptions: {
                color: outerEyeColor || '#000000',
                type: outerEyeType === 'rounded' ? 'extra-rounded' : (outerEyeType as any)
            },
            cornersDotOptions: {
                color: innerEyeColor || '#000000',
                type: innerEyeType
            },
            backgroundOptions: {
                color: '#FFFFFF00'
            }
        };
    }

    buildQrCodeViewProperties(realQrHeight: number) {
        const { size } = this._params;

        const qrPadding = 30;
        const qrCodeMargin = size * (qrPadding / this._baseSize);
        const adjustedQRCodeSize = size * (this._qrCodeBaseSize / this._baseSize) - qrCodeMargin;

        const margin = size * (this._baseMargin / this._baseSize);
        const svgQrPosition = size - adjustedQRCodeSize - margin - qrCodeMargin;

        const differencePercent = 1 + (adjustedQRCodeSize - realQrHeight) / realQrHeight;
        const position = (adjustedQRCodeSize - realQrHeight - qrCodeMargin) / 2 + qrCodeMargin;
        const zoom = size / differencePercent;
        const svgViewBox = `${position} ${position} ${zoom} ${zoom}`;

        return {
            adjustedQRCodeSize,
            qrCodeMargin,
            svgQrPosition,
            svgViewBox
        };
    }
}
