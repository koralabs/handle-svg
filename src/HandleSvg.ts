import { IHandleSvg } from './interfaces/IHandleSvg';
import { IHandleSvgOptions } from './interfaces';
import { IPFS_GATEWAY, OG_TOTAL } from './utils/constants';
import { getRarityHex } from './utils';
export default class HandleSvg {
    private _options: IHandleSvgOptions;
    private _params: { size: number; handle: string; disableDollarSymbol: boolean };
    private _baseMargin: number = 80;
    private _baseSize: number = 2048;
    private _margin: number;

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
        const x = this._margin;
        const y = this._margin;
        const scale = (size / this._baseSize) * 4;
        return `
            <svg xmlns="http://www.w3.org/2000/svg" x="${x}" y="${y}">
                <path transform="scale(${scale})" id="S" fill="#0cd15b" d="M3.48,1.16c0-.28,.21-.54,.64-.78,.43-.25,.99-.38,1.7-.38,.54,0,.89,.12,1.05,.36,.11,.17,.17,.33,.17,.47v.54c1.28,.14,2.16,.4,2.66,.76,.2,.14,.31,.28,.31,.42,0,.63-.14,1.3-.42,2.02-.27,.72-.54,1.08-.8,1.08-.05,0-.19-.05-.44-.16-.75-.35-1.37-.52-1.86-.52s-.82,.05-1,.14c-.17,.1-.25,.25-.25,.45,0,.19,.12,.34,.37,.45,.25,.11,.55,.2,.92,.29,.37,.07,.77,.2,1.2,.38,.44,.18,.85,.4,1.22,.65,.37,.25,.68,.63,.93,1.14,.25,.49,.37,1,.37,1.52s-.05,.95-.14,1.28c-.09,.34-.25,.69-.47,1.05-.21,.36-.55,.69-1,.98-.44,.28-.97,.48-1.59,.61v.29c0,.28-.21,.54-.64,.78-.43,.25-.99,.38-1.7,.38-.54,0-.89-.12-1.05-.36-.11-.17-.17-.33-.17-.47v-.54c-.73-.07-1.37-.19-1.92-.34-1.04-.3-1.56-.63-1.56-.98,0-.67,.09-1.37,.27-2.1,.18-.73,.4-1.1,.64-1.1,.05,0,.51,.16,1.41,.49s1.57,.49,2.02,.49,.75-.05,.88-.14c.14-.11,.2-.26,.2-.45s-.12-.36-.37-.49c-.25-.14-.56-.26-.93-.34-.37-.08-.78-.22-1.22-.4-.43-.18-.83-.39-1.2-.63-.37-.24-.68-.6-.93-1.07-.25-.47-.37-1.02-.37-1.64C.39,3.06,1.42,1.76,3.48,1.39v-.23Z" />
                <path transform="scale(${scale})" id="handle" fill="#fff" d="M66.45,6.38c-.49,0-.91,.16-1.24,.48-.32,.32-.51,.82-.57,1.5h3.6c-.01-.58-.16-1.05-.45-1.42-.29-.38-.74-.57-1.35-.57Zm-.02-1.83c1.3,0,2.33,.37,3.09,1.12,.76,.74,1.14,1.79,1.14,3.16v1.24h-6.07c.02,.73,.24,1.3,.64,1.71,.41,.41,.98,.62,1.71,.62,.61,0,1.16-.06,1.66-.17,.49-.13,1.01-.32,1.53-.57v1.99c-.46,.23-.95,.4-1.47,.5-.51,.12-1.12,.17-1.85,.17-.94,0-1.78-.17-2.5-.52-.72-.36-1.29-.89-1.71-1.61-.41-.71-.62-1.61-.62-2.7s.18-2.02,.55-2.75c.38-.74,.9-1.29,1.57-1.66s1.44-.55,2.33-.55Zm-6.56,9.61h-2.57V1.02h2.57V14.16Zm-9.6-1.88c.71,0,1.21-.21,1.5-.62,.29-.43,.44-1.06,.45-1.9v-.28c0-.92-.14-1.63-.43-2.11-.28-.48-.79-.73-1.55-.73-.56,0-1.01,.25-1.33,.74-.32,.48-.48,1.19-.48,2.11s.16,1.62,.48,2.09c.32,.46,.78,.69,1.36,.69Zm-.9,2.06c-1.05,0-1.9-.41-2.57-1.23-.66-.83-.98-2.05-.98-3.65s.33-2.84,1-3.67,1.54-1.24,2.62-1.24c.68,0,1.24,.13,1.67,.4s.78,.59,1.03,.99h.09c-.03-.18-.07-.45-.12-.8-.05-.36-.07-.72-.07-1.09V1.02h2.57V14.16h-1.97l-.5-1.23h-.1c-.25,.39-.59,.73-1.02,1-.43,.27-.98,.4-1.66,.4Zm-8.97-9.79c1.01,0,1.82,.28,2.43,.83,.61,.54,.91,1.42,.91,2.63v6.15h-2.57v-5.51c0-.68-.12-1.19-.36-1.52-.24-.35-.63-.52-1.16-.52-.78,0-1.32,.27-1.6,.81-.29,.53-.43,1.3-.43,2.3v4.44h-2.57V4.72h1.97l.34,1.21h.14c.3-.48,.71-.84,1.22-1.05,.53-.22,1.09-.33,1.67-.33Zm-11.53,5.27c-.83,.02-1.4,.17-1.72,.45-.32,.28-.48,.64-.48,1.09,0,.39,.11,.67,.34,.85,.23,.16,.53,.24,.9,.24,.55,0,1.02-.16,1.4-.48,.38-.33,.57-.8,.57-1.4v-.78l-1,.03Zm-.36-5.29c1.26,0,2.23,.28,2.9,.83,.68,.54,1.02,1.38,1.02,2.51v6.29h-1.79l-.5-1.28h-.07c-.4,.51-.83,.88-1.28,1.11s-1.06,.35-1.85,.35c-.84,0-1.53-.24-2.09-.73-.55-.5-.83-1.25-.83-2.26s.35-1.74,1.05-2.21c.7-.48,1.75-.75,3.16-.8l1.64-.05v-.41c0-.5-.13-.86-.4-1.09-.25-.23-.61-.35-1.07-.35s-.91,.07-1.35,.21c-.44,.13-.87,.29-1.31,.48l-.84-1.75c.51-.27,1.06-.47,1.67-.62,.62-.15,1.26-.22,1.93-.22Zm-12.63-.83c0,.46-.02,.9-.05,1.33-.02,.43-.05,.73-.07,.9h.14c.3-.48,.68-.84,1.16-1.05,.47-.22,.99-.33,1.57-.33,1.02,0,1.84,.28,2.45,.83,.62,.54,.93,1.42,.93,2.63v6.15h-2.57v-5.51c0-1.36-.51-2.04-1.52-2.04-.77,0-1.3,.27-1.6,.81-.29,.53-.43,1.3-.43,2.3v4.44h-2.57V1.02h2.57V3.7Z" />
            </svg>
        `;
    }

    buildBackground() {
        const { size } = this._params;
        const { backgroundColor } = this._options;
        return `<rect width="${size}" height="${size}" fill="${backgroundColor || '#0d0f26ff'}" />`;
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
        const { backgroundImageUrl, backgroundImageUrlEnabled } = this._options;
        return backgroundImageUrlEnabled && backgroundImageUrl
            ? `<image href="${IPFS_GATEWAY}/${backgroundImageUrl.replace(
                  ':/',
                  ''
              )}" height="${size}" width="${size}" />`
            : '';
    };

    buildPfpImage() {
        const { size } = this._params;
        const { pfpImageUrl, pfpImageUrlEnabled, pfpZoom, pfpOffset, pfpBorderColorEnabled, pfpBorderColor } =
            this._options;

        if (!pfpImageUrlEnabled || !pfpImageUrl) return '';

        const pfpCircleSize = size * (576 / this._baseSize);
        let pfpImageSize = parseInt(`${pfpCircleSize}`);

        // add zoom if it exists
        if (pfpZoom) {
            if (pfpZoom > 1) {
                pfpImageSize = pfpCircleSize * pfpZoom;
            }
        }

        const dx = size / 2;
        const dy = size * (463 / this._baseSize);
        const radius = pfpCircleSize / 2;

        const strokeWidth = size * (30 / this._baseSize);

        let pfpImageX = parseInt(`${dx}`) - radius;
        let pfpImageY = parseInt(`${dy}`) - radius;

        if (pfpOffset) {
            const [x, y] = pfpOffset;
            pfpImageX += size * (x / this._baseSize);
            pfpImageY += size * (y / this._baseSize);
        }

        return `<svg>
                    <defs>
                        <clipPath id="circle-path">
                            <circle cx="${dx}" cy="${dy}" r="${radius}" />
                        </clipPath>
                    </defs>
                    ${
                        pfpBorderColorEnabled
                            ? `<circle cx="${dx}" cy="${dy}" r="${radius + strokeWidth}" fill="${
                                  pfpBorderColor ?? '#fff'
                              }" />`
                            : ''
                    }
                    <image clip-path="url(#circle-path)" height="${pfpImageSize}" width="${pfpImageSize}" x="${pfpImageX}" y="${pfpImageY}" href="${IPFS_GATEWAY}/${pfpImageUrl.replace(
            ':/',
            ''
        )}" />
                </svg>`;
    }

    buildTextRibbon = () => {
        const getGradientStops = (colors: string[]) => {
            const stops = [];
            for (let i = 0; i < colors.length; i++) {
                stops.push(`<stop offset="${(i / (colors.length - 1)) * 100}%" stop-color="${colors[i]}" />`);
            }
            return stops.join('');
        };

        const { size } = this._params;
        const { textRibbonColors, textRibbonColorsEnabled, textRibbonGradient, textRibbonGradientEnabled } =
            this._options;
        const height = size * (314 / this._baseSize);
        const x = 0;
        const y = size / 2 - height / 2;

        if (textRibbonColorsEnabled && textRibbonColors && textRibbonColors.length > 0) {
            // check if gradient is enabled
            if (
                textRibbonGradientEnabled &&
                textRibbonGradient &&
                textRibbonGradient !== 'none' &&
                textRibbonColors.length > 1
            ) {
                return `
                <svg>
                    <defs>
                        ${
                            textRibbonGradient.startsWith('linear')
                                ? `<linearGradient id="grad1" gradientTransform="rotate(${
                                      textRibbonGradient.split('-')[1]
                                  } 0.5 0.5)">${getGradientStops(textRibbonColors)}</linearGradient>`
                                : `<radialGradient id="grad1">${getGradientStops(textRibbonColors)}</radialGradient>`
                        }
                    </defs>
                    <rect x="${x}" y="${y}" width="${size}" height="${height}" style="fill: url(#grad1)" />
                </svg>
                `;
            }

            return `
                <svg>
                    <rect x="0" y="${size / 2 - height / 2}" width="${size}" height="${height}" style="fill: ${
                textRibbonColors[0]
            }" />
                </svg>
            `;
        }

        return '';
    };

    buildBackgroundBorder = () => {
        const { size } = this._params;
        const { backgroundBorderColor, backgroundBorderColorEnabled } = this._options;
        const strokeWidth = size * (30 / this._baseSize);
        const recSize = size - strokeWidth;
        return backgroundBorderColorEnabled
            ? `<rect x="${strokeWidth / 2}" y="${
                  strokeWidth / 2
              }" width="${recSize}" height="${recSize}" fill="none" stroke-width="${strokeWidth}" stroke="${backgroundBorderColor}" />`
            : '';
    };

    buildDollarSign = () => {
        const { size, handle } = this._params;
        const dollarSignWidth = size * (300 / this._baseSize);
        const x = size - dollarSignWidth - this._margin;
        const y = this._margin;
        const scale = (size / this._baseSize) * 4;
        return `<svg x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
        <path fill="${getRarityHex(
            handle
        )}" transform="scale(${scale})" d="M25.02,8.1c0-1.94,1.55-3.75,4.64-5.44,3.09-1.77,7.16-2.66,12.21-2.66,3.91,0,6.43,.84,7.57,2.53,.81,1.18,1.22,2.28,1.22,3.29v3.79c9.2,1.01,15.58,2.78,19.16,5.31,1.46,1.01,2.2,1.98,2.2,2.91,0,4.39-1.02,9.11-3.05,14.17-1.95,5.06-3.87,7.59-5.74,7.59-.33,0-1.38-.38-3.17-1.14-5.37-2.45-9.85-3.67-13.43-3.67s-5.9,.34-7.2,1.01c-1.22,.67-1.83,1.73-1.83,3.16,0,1.35,.9,2.4,2.69,3.16,1.79,.76,3.99,1.43,6.59,2.02,2.69,.51,5.57,1.39,8.67,2.66,3.17,1.26,6.1,2.78,8.79,4.55,2.69,1.77,4.92,4.43,6.71,7.97,1.79,3.46,2.69,7,2.69,10.63s-.33,6.62-.98,8.98-1.79,4.81-3.42,7.34c-1.55,2.53-3.95,4.81-7.2,6.83-3.17,1.94-7,3.37-11.47,4.3v2.02c0,1.94-1.55,3.75-4.64,5.44-3.09,1.77-7.16,2.66-12.21,2.66-3.91,0-6.43-.84-7.57-2.53-.81-1.18-1.22-2.28-1.22-3.29v-3.79c-5.29-.51-9.89-1.31-13.79-2.4-7.49-2.11-11.23-4.39-11.23-6.83,0-4.72,.65-9.61,1.95-14.67,1.3-5.14,2.85-7.72,4.64-7.72,.33,0,3.7,1.14,10.13,3.42,6.43,2.28,11.27,3.42,14.53,3.42s5.37-.34,6.35-1.01c.98-.76,1.46-1.81,1.46-3.16s-.9-2.49-2.69-3.42c-1.79-1.01-4.03-1.81-6.71-2.4-2.69-.59-5.61-1.52-8.79-2.78-3.09-1.26-5.98-2.74-8.67-4.43-2.69-1.69-4.92-4.17-6.71-7.46-1.79-3.29-2.69-7.13-2.69-11.51,0-15.52,7.41-24.58,22.22-27.2v-1.64Z" />
    </svg>`;
    };

    buildOG = () => {
        const { size, handle } = this._params;
        const { fontUrl, ogNumber } = this._options;

        if (!ogNumber) {
            return '';
        }

        const f =
            fontUrl && fontUrl !== ''
                ? fontUrl
                : 'Ubuntu Mono,https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap';
        const [fontFamily, font] = f.split(',');
        const fontSize = size * (48 / this._baseSize);
        const dollarSignWidth = size * (300 / this._baseSize);
        const x = size - dollarSignWidth - this._margin;
        const y = size * (560 / this._baseSize);
        return `<svg x="${x}" y="${y}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <style type="text/css">
                @import url('${font}');
            </style>
        </defs>
        <text transform="translate(${dollarSignWidth / 2})"
        ><tspan dominant-baseline="hanging"
        text-anchor="middle"
        fill="${getRarityHex(handle)}"
        font-size="${fontSize}"
        font-family="${fontFamily}"
        font-weight="400">OG ${ogNumber}/${OG_TOTAL}</tspan></text>
    </svg>`;
    };

    buildHandleName() {
        const { size, handle } = this._params;
        const {
            fontColor,
            fontColorEnabled,
            fontShadowColor,
            fontShadowColorEnabled,
            fontUrl,
            fontShadowHorzOffset = 8,
            fontShadowVertOffset = 8,
            fontShadowBlur = 8
        } = this._options;

        const f =
            fontUrl && fontUrl !== ''
                ? fontUrl
                : 'Ubuntu Mono,https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap';
        const [fontFamily, font] = f.split(',');
        const fontSize = size * (200 / this._baseSize);
        const horizontalOffset = size * (fontShadowHorzOffset / this._baseSize);
        const verticalOffset = size * (fontShadowVertOffset / this._baseSize);
        const blur = size * (fontShadowBlur / this._baseSize);

        return fontShadowColorEnabled
            ? `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
                    <defs>
                        <style type="text/css">
                            @import url('${font}');
                        </style>
                    </defs>
                    <text style="text-shadow: ${horizontalOffset}px ${verticalOffset}px ${blur}px ${fontShadowColor};" x="50%" y="50%" dominant-baseline="central" fill="${
                  fontColorEnabled && fontColor ? fontColor : '#fff'
              }" font-size="${fontSize}" font-family="${fontFamily}" font-weight="400" text-anchor="middle">${handle}</text>
                </svg>`
            : `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
                    <defs>
                        <style type="text/css">
                            @import url('${font}');
                        </style>
                    </defs>
                    <text x="50%" y="50%" dominant-baseline="central" fill="${
                        fontColorEnabled && fontColor ? fontColor : '#fff'
                    }" font-size="${fontSize}" font-family="${fontFamily}" font-weight="400" text-anchor="middle">${handle}</text>
                </svg>`;
    }

    buildQRCode = () => {
        const { size, handle } = this._params;
        const { qrEnabled } = this._options;
        const baseQRCodeSize = size * (420 / this._baseSize);
        const pos = size - baseQRCodeSize - this._margin;
        if (qrEnabled) {
            return `<svg id="qr_code_${handle}" x="${pos}" y="${pos}"></svg>`;
        }

        return '';
    };

    renderSocialIcon({ social, socialHeight }: { social: string; socialHeight: number }) {
        const x = 15;
        const { size } = this._params;
        const scale = (size / this._baseSize) * 4;

        if (social === 'twitter') {
            return `<svg id="logoDiscord" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
                        <path transform="scale(${scale})" id="twitter_logo" fill="#fff" d="M12.01,2.71c0,.12,0,.24,0,.35,0,3.63-2.76,7.81-7.81,7.81h0c-1.49,0-2.95-.43-4.21-1.23,.22,.03,.44,.04,.65,.04,1.24,0,2.44-.41,3.41-1.18-1.17-.02-2.21-.79-2.57-1.91,.41,.08,.84,.06,1.24-.05-1.28-.26-2.2-1.38-2.2-2.69v-.03c.38,.21,.81,.33,1.25,.34C.57,3.36,.2,1.76,.93,.5c1.39,1.72,3.45,2.76,5.66,2.87-.22-.95,.08-1.95,.79-2.62,1.11-1.04,2.84-.99,3.88,.12,.61-.12,1.2-.35,1.74-.67-.2,.64-.63,1.18-1.21,1.52,.54-.06,1.08-.21,1.58-.43-.37,.55-.83,1.03-1.37,1.42Z" />
                    </svg>`;
        } else if (social === 'facebook') {
            return `<svg id="logoDiscord" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
                        <path transform="scale(${
                            scale / 2
                        })" id="facebook_logo" fill="#fff" d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" />
                    </svg>`;
        }

        return `<svg id="logoDiscord" xmlns="http://www.w3.org/2000/svg" fillRule="evenodd" clipRule="evenodd">
                    <path transform="scale(${
                        scale / 2
                    })" id="discord_logo" fill="#fff" d="M19.54 0c1.356 0 2.46 1.104 2.46 2.472v21.528l-2.58-2.28-1.452-1.344-1.536-1.428.636 2.22h-13.608c-1.356 0-2.46-1.104-2.46-2.472v-16.224c0-1.368 1.104-2.472 2.46-2.472h16.08zm-4.632 15.672c2.652-.084 3.672-1.824 3.672-1.824 0-3.864-1.728-6.996-1.728-6.996-1.728-1.296-3.372-1.26-3.372-1.26l-.168.192c2.04.624 2.988 1.524 2.988 1.524-1.248-.684-2.472-1.02-3.612-1.152-.864-.096-1.692-.072-2.424.024l-.204.024c-.42.036-1.44.192-2.724.756-.444.204-.708.348-.708.348s.996-.948 3.156-1.572l-.12-.144s-1.644-.036-3.372 1.26c0 0-1.728 3.132-1.728 6.996 0 0 1.008 1.74 3.66 1.824 0 0 .444-.54.804-.996-1.524-.456-2.1-1.416-2.1-1.416l.336.204.048.036.047.027.014.006.047.027c.3.168.6.3.876.408.492.192 1.08.384 1.764.516.9.168 1.956.228 3.108.012.564-.096 1.14-.264 1.74-.516.42-.156.888-.384 1.38-.708 0 0-.6.984-2.172 1.428.36.456.792.972.792.972zm-5.58-5.604c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332.012-.732-.54-1.332-1.224-1.332zm4.38 0c-.684 0-1.224.6-1.224 1.332 0 .732.552 1.332 1.224 1.332.684 0 1.224-.6 1.224-1.332 0-.732-.54-1.332-1.224-1.332z" />
                </svg>`;
    }

    buildSocialsSvg() {
        const { size } = this._params;
        const { socials, socialsEnabled, fontUrl } = this._options;
        const f =
            fontUrl && fontUrl !== ''
                ? fontUrl
                : 'Ubuntu Mono,https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap';
        const [fontFamily, font] = f.split(',');
        const socialSize = size * (48 / this._baseSize);
        const fontSize = size * (64 / this._baseSize);
        const socialSpacing = size * (80 / this._baseSize);
        const x = this._margin;
        const y = size - socialSize - this._margin;
        return socialsEnabled && socials && socials.length > 0
            ? socials.map((social: any, index: number) => {
                  return `<svg xmlns="http://www.w3.org/2000/svg" x="${x}" y="${y - index * socialSpacing}">
                                ${this.renderSocialIcon({
                                    social: social.key,
                                    socialHeight: socialSize
                                })}
                                <defs>
                                    <style type="text/css">
                                        @import url('${font}');
                                    </style>
                                </defs>
                                <text
                                    x="${socialSize + socialSize / 3}"
                                    dominant-baseline="hanging"
                                    fill="#fff"
                                    font-size="${fontSize}"
                                    font-family="${fontFamily}"
                                    font-weight="400"
                                >
                                    ${social.value}
                                </text>
                            </svg>`;
              })
            : undefined;
    }

    build() {
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
                ${this.buildHandleName()}
                ${this.buildQRCode()}
                ${this.buildSocialsSvg()}
            </svg>
        `;
    }

    buildQrCodeOptions(): any {
        const { size, handle } = this._params;
        const { qrBgColor, qrDot, qrInnerEye, qrOuterEye, qrEnabled } = this._options;

        if (!qrEnabled) return undefined;

        const [dotType, dotColor] = qrDot?.split(',') ?? ['square', '#000000'];
        const [innerEyeType, innerEyeColor] = qrInnerEye?.split(',') ?? ['square', '#000000'];
        const [outerEyeType, outerEyeColor] = qrOuterEye?.split(',') ?? ['square', '#000000'];

        const qrCodeSize = size * (430 / this._baseSize);

        return {
            width: qrCodeSize,
            height: qrCodeSize,
            type: 'svg',
            data: `http://handle.me/${handle}`,
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
                color: qrBgColor || '#FFFFFF'
            }
        };
    }
}
