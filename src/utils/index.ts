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
