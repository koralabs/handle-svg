import { HexString } from '@koralabs/kora-labs-common';

export const getRarityFromLength = (length: number): string => {
    if (1 === length) return 'Legendary';
    if (2 === length) return 'Ultra Rare';
    if (3 === length) return 'Rare';
    if (length > 3 && length < 8) return 'Common';
    return 'Basic';
};

/**
 * The segment a handle's rarity is derived from: the root handle for a subhandle
 * (`sub@root` -> `root`), otherwise the handle itself. A subhandle inherits its
 * root handle's rarity color (handle.me#872). Note: rarity COLOR uses this root
 * segment, but text sizing (getMinimumFontSize) deliberately keeps the full
 * displayed handle length.
 */
export const getRarityHandleSegment = (handle: string): string =>
    handle.includes('@') ? handle.split('@').pop() ?? handle : handle;

export const getRarityHex = (handle: string): string => {
    const rarity = getRarityFromLength(getRarityHandleSegment(handle).length);
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

export const getMinimumFontSize = (handle: string): number => {
    const rarity = getRarityFromLength(handle.length);
    switch (rarity) {
        case 'Legendary':
            return 95;
        case 'Ultra Rare':
            return 95;
        case 'Rare':
            return 95;
        case 'Common':
            return 180;
        default:
            return 180;
    }
};

export const hexToColorHex = (hex: HexString) => hex.replace('0x', '#');

export const getFontDetails = (font?: string) => {
    const defaultFontLink = 'https://fonts.gstatic.com/s/ubuntumono/v15/KFO-CneDtsqEr0keqCMhbC-BL9H1tY0.woff2';

    if (!font || font === '') {
        return defaultFontLink;
    }

    const match = font.match(/(woff|eot|woff2|ttf|svg)$/g);
    if (!match) {
        return defaultFontLink;
    }

    if (font.includes(',')) {
        const [ , fontLink] = font.split(',');
        return fontLink;
    }

    return font;
};

export { getSocialIcon } from './getSocialIcon';

export { getMaxOffset } from './getMaxOffset';

export { getImageDetails } from './imageHelpers';