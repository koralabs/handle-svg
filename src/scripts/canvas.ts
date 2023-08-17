import fs from 'fs';
import { createCanvas, loadImage } from 'canvas';
import https from 'https';
import sharp from 'sharp'

(async () => {
    let bgImageSvg: string | undefined;
    https.get(
        'https://public-handles.myfilebase.com/ipfs/QmQB24x3XyWVofvbd3qYXNB4icJTcBgPmtYXEcuEpMF1Fs',
        async (res) => {
            let data: Uint8Array = new Uint8Array();
            res.on('data', (chunk) => {
                data = new Uint8Array([...data, ...chunk]);
            });
            res.on('end', async () => {
                const bgImage = await loadImage(Buffer.from(data));
                const bgCanvas = createCanvas(2048, 2048, 'svg');
                const bgCtx = bgCanvas.getContext('2d');
                bgCtx.drawImage(bgImage, 0, 0, 2048, 2048);
                fs.writeFileSync('bg.svg', bgCanvas.toBuffer());
                await sharp(bgCanvas.toBuffer()).jpeg().toFile('pz.jpg');
            });
        }
    );
})();
