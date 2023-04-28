import * as fs from 'fs';
import { IHandleSvg, IHandleSvgOptions } from '../interfaces';
import HandleSvg from '../HandleSvg';
import { convert } from './convert';

const options: IHandleSvgOptions = {
    fontShadowColor: '#475081',
    fontShadowColorEnabled: true,
    fontColor: '#ff6130',
    fontColorEnabled: true,
    fontUrl: 'Tilt Prism,https://tinyurl.com/2an5pb5a',
    textRibbonColors: ['#000000', '#12546294'],
    textRibbonColorsEnabled: true,
    textRibbonGradient: 'radial',
    textRibbonGradientEnabled: true,
    pfpImageUrl: 'ipfs://QmY3uZmaBrWiCAisREsKMwhJyaDXSUxk5PiC6hVoVLW1iP',
    pfpImageUrlEnabled: true,
    pfpZoom: 1,
    pfpOffset: [0, 0],
    pfpBorderColor: '#202341',
    pfpBorderColorEnabled: true,
    backgroundImageUrl: 'ipfs://QmSkgqaCapgw99Y2oAZ72tj9iGRb89DzM7kJPetvsj7NND',
    backgroundImageUrlEnabled: true,
    backgroundBorderColor: '#797986',
    backgroundBorderColorEnabled: true,
    backgroundColor: '#be4961',
    backgroundColorEnabled: true,
    qrEnabled: true,
    qrBgColor: '#00000000',
    qrInnerEye: 'square,#f2f285',
    qrOuterEye: 'rounded,#f2f285',
    qrDot: 'rounded,#ff6130',
    socials: [{ key: 'discord', value: 'testing' }],
    socialsEnabled: true
};

(async () => {
    const size = 2048;
    const ratio = size / 512;
    const handle = 'bigirishlion';

    const input: IHandleSvg = {
        handle,
        size,
        ratio,
        options,
        disableDollarSymbol: false
    };

    const handleSvg = new HandleSvg(input);

    const result = await convert(handle, handleSvg, size);

    // write jpg
    fs.writeFile('test_svg.jpg', result, (err: any) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        console.log('JPG written!');
    });

    const html = `
    <html>
        <head>
            <title>${handle} SVG</title>
            <script type="text/javascript" src="https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js"></script>
        </head>
        <body style="margin: 0; padding: 0;">
            ${handleSvg.build()}
        </body>
        <script>
            const qrCode = new QRCodeStyling(${JSON.stringify(handleSvg.buildQrCodeOptions())});
            qrCode.append(document.getElementById("qr_code_${handle}"));
        </script>
    </html>
    `;

    // write html file
    fs.writeFile('test_handle.html', html, (err: any) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        console.log('HTML written!');
    });
})();
