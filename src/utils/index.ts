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
            return '#aa8ed6';
        case 'Rare':
            return '#55acee';
        case 'Common':
            return '#78b159';
        default:
            return '#ffffff';
    }
};
