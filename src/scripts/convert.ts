import HandleSvg from '../HandleSvg';
import sharp from 'sharp';

export const convert = async (
    handle: string,
    handleSvg: HandleSvg,
    size: number,
    decompress: any,
    jsDom: any,
    QRCodeStyling: any
): Promise<Buffer> => {
    const svg = await handleSvg.build(decompress, jsDom, QRCodeStyling);
    const buffer = await sharp(Buffer.from(svg)).jpeg().toBuffer();
    return buffer;
};
