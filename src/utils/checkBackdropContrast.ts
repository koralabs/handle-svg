import { checkContrast } from './checkContrast';

export interface BackdropContrastResult {
    /** true when the text colour is legible over enough of the sampled backdrop */
    sufficient: boolean;
    /** share (0-1) of sampled pixels where the text colour fails the contrast ratio */
    failingFraction: number;
    /** number of pixels sampled (fully transparent pixels are skipped) */
    sampled: number;
}

const hex2 = (n: number) => Math.round(n).toString(16).padStart(2, '0');

/**
 * Contrast of a text colour against the real pixels behind it, instead of one flat bg/ribbon colour.
 * `pixels` is raw RGBA (4 bytes per pixel) cropped to the text region of the composed render.
 * Pixels are checked one by one with the same rule as `checkContrast`; the text is insufficient
 * when more than `maxFailingFraction` of them fail. No pixels to sample means nothing is behind
 * the text, so it is sufficient.
 */
export const checkBackdropContrast = (
    pixels: ArrayLike<number>,
    textHex: string,
    acceptableContrastRatio = 1.2,
    maxFailingFraction = 0.2
): BackdropContrastResult => {
    if (pixels.length % 4 !== 0) throw new Error('pixels must be RGBA (length divisible by 4)');
    let sampled = 0;
    let failing = 0;
    // identical pixels are common (flat areas); cache the verdict per colour
    const verdicts = new Map<number, boolean>();
    for (let i = 0; i < pixels.length; i += 4) {
        const a = pixels[i + 3];
        if (a === 0) continue;
        const key = ((pixels[i] << 24) | (pixels[i + 1] << 16) | (pixels[i + 2] << 8) | a) >>> 0;
        let ok = verdicts.get(key);
        if (ok === undefined) {
            const bg = hex2(pixels[i]) + hex2(pixels[i + 1]) + hex2(pixels[i + 2]) + hex2(a);
            ok = checkContrast(bg, textHex, acceptableContrastRatio);
            verdicts.set(key, ok);
        }
        sampled++;
        if (!ok) failing++;
    }
    const failingFraction = sampled === 0 ? 0 : failing / sampled;
    return { sufficient: failingFraction <= maxFailingFraction, failingFraction, sampled };
};
