import { HexString } from '@koralabs/handles-public-api-interfaces';

export const getRarityFromLength = (length: number): string => {
    if (1 === length) return 'Legendary';
    if (2 === length) return 'Ultra Rare';
    if (3 === length) return 'Rare';
    if (length > 3 && length < 8) return 'Common';
    return 'Basic';
};

export const getRarityHex = (handle: string): string => {
    const rarity = getRarityFromLength(handle.length);
    switch (rarity) {
        case 'Legendary':
            return '#f4900c';
        case 'Ultra Rare':
            return '#593292';
        case 'Rare':
            return '#55acee';
        case 'Common':
            return '#0cd15b';
        default:
            return '#ffffff';
    }
};

export const hexToColorHex = (hex: HexString) => hex.replace('0x', '#');

export const getFontDetails = (font?: string) => {
    const f =
        font && font !== ''
            ? font
            : 'Ubuntu Mono,https://fonts.googleapis.com/css2?family=Ubuntu+Mono:wght@400;700&display=swap';
    const [fontFamily, fontLink] = f.split(',');
    let fontCss = `@import url('${fontLink}');`;

    // use regular expression to match font file extensions (woff|eot|woff2|ttf|svg)
    const match = fontLink.match(/(woff|eot|woff2|ttf|svg)$/g);
    if (match) {
        const [fontExtension] = match;
        let format = '';
        if (fontExtension === 'svg') {
            format = 'svg';
        } else if (fontExtension === 'eot') {
            format = 'embedded-opentype';
        } else if (fontExtension === 'ttf') {
            format = 'truetype';
        } else if (fontExtension === 'woff') {
            format = 'woff';
        } else if (fontExtension === 'woff2') {
            format = 'woff2';
        }

        fontCss = `@font-face {font-family: '${fontFamily}'; src: url('${fontLink}') format('${format}');}`;
    }

    return { fontFamily, fontCss };
};

export { getSocialIcon } from './getSocialIcon';
