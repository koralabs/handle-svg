import HandleSvg from '../HandleSvg';

const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');

export const convert = async (handle: string, handleSvg: HandleSvg, size: number): Promise<Buffer> => {
    const svg = handleSvg.build();
    const width = size;
    const height = size;

    const browser = await puppeteer.launch({
        args: undefined, // chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
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
            <script type="text/javascript" src="https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js"></script>
        </head>
        <body>${svg}</body>
        <script>
            const qrCode = new QRCodeStyling(${JSON.stringify(handleSvg.buildQrCodeOptions())});
            qrCode.append(document.getElementById("qr_code_${handle}"));
        </script>
    </html>
    `;

    const page = await browser.newPage();
    await page.setViewport({ width, height });
    await page.setContent(html);

    const buffer = await page.screenshot({ clip: { x: 0, y: 0, width, height }, type: 'jpeg', quality: 100 });

    await browser.close();

    return buffer;
};
