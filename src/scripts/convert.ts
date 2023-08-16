import HandleSvg from '../HandleSvg';
import render from 'svg-render';

export const convert = async (
    handle: string,
    handleSvg: HandleSvg,
    size: number,
    decompress: any,
    jsDom: any,
    QRCodeStyling: any
): Promise<Buffer> => {
    const svg = await handleSvg.build(decompress, jsDom, QRCodeStyling);
    const width = size;
    const height = size;

    const buffer = await render({ buffer: Buffer.from(svg), width, height });

    return buffer;
};
