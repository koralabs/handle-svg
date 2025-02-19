export const getFontArrayBuffer = async (
    fontLink: string,
    decompress: (src: Uint8Array | Buffer) => Promise<Uint8Array>
) => {
    const fontResponse = await fetch(fontLink).then((res) => res);
    const buffer = await fontResponse.arrayBuffer();
    const fontType = fontResponse.headers.get('Content-Type');

    function toArrayBuffer(buffer: any) {
        const ab = new ArrayBuffer(buffer.length);
        const view = new Uint8Array(ab);
        for (let i = 0; i < buffer.length; ++i) {
            view[i] = buffer[i];
        }
        return ab;
    }

    let fontArrayBuffer = buffer;
    if (fontType?.includes('woff2') || fontLink.includes('woff2')) {
        // decompress before parsing
        fontArrayBuffer = toArrayBuffer(await decompress(new Uint8Array(buffer)));
    }

    return fontArrayBuffer;
};
