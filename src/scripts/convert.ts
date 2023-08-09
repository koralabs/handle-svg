import HandleSvg from '../HandleSvg';
import puppeteer from 'puppeteer';

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

    const browser = await puppeteer.launch({
        args: ['--font-render-hinting=none', '--disable-font-subpixel-positioning'],
        executablePath: puppeteer.executablePath(),
        headless: 'new',
        ignoreHTTPSErrors: true
    });

    const html = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8">
            <style>
                * { margin: 0; padding: 0; }
                html { background-color: #FFF; }
            </style>
        </head>
        <body>${svg}</body>
    </html>
    `;

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setContent(html);

    const buffer = await page.screenshot({ clip: { x: 0, y: 0, width, height }, type: 'jpeg', quality: 100 });

    await browser.close();

    return buffer;
};
