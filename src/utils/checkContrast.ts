const getLuminance = (hex: string): number => {
    let A = 1;
    const R = parseInt(hex.substr(0, 2), 16);
    const G = parseInt(hex.substr(2, 2), 16);
    const B = parseInt(hex.substr(4, 2), 16);
    if (hex.length > 6) {
        A = parseInt(hex.substr(6, 2), 16) / 255;
    }
    const lumcolor = 0.2126 * R + 0.7152 * G + 0.0722 * B;
    return lumcolor + (255 - lumcolor) * (1 - A);
};

export const checkContrast = (hex1: string, hex2: string, acceptableContrastRatio = 1.2) => {
    const color1 = hex1.replace('#', '');
    const color2 = hex2.replace('#', '');
    const brightest = Math.max(getLuminance(color1), getLuminance(color2)) + 0.05;
    const darkest = Math.min(getLuminance(color1), getLuminance(color2)) + 0.05;

    const contrastRatio = brightest / darkest;

    return contrastRatio > acceptableContrastRatio;
};
