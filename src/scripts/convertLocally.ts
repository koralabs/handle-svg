import * as fs from 'fs';
import { IHandleSvgOptions } from '../interfaces';
import HandleSvg from '../HandleSvg';
import { convert } from './convert';

const options: IHandleSvgOptions = {
    fontShadowColor: '#475081',
    fontShadowColorEnabled: true,
    fontColor: '#202341',
    fontColorEnabled: true,
    fontUrl: 'Tilt Prism,https://fonts.googleapis.com/css2?family=Tilt+Prism&display=swap',
    textRibbonColors: ['#b5342185', '#42184a'],
    textRibbonColorsEnabled: true,
    textRibbonGradient: 'radial',
    textRibbonGradientEnabled: true,
    pfpImageUrl: 'https://ipfs.io/ipfs/QmY3uZmaBrWiCAisREsKMwhJyaDXSUxk5PiC6hVoVLW1iP',
    pfpImageUrlEnabled: true,
    pfpZoom: 0.86,
    pfpOffset: [-56, -30],
    pfpBorderColor: '#202341',
    pfpBorderColorEnabled: true,
    backgroundImageUrl: 'https://live.staticflickr.com/6060/6999428845_38db1486d5_k.jpg',
    backgroundImageUrlEnabled: true,
    backgroundBorderColor: '#797986',
    backgroundBorderColorEnabled: true,
    backgroundColor: '#be4961',
    backgroundColorEnabled: true,
    qrEnabled: true,
    qrBgColor: '#00000000',
    qrInnerEye: 'square,#42184a',
    qrOuterEye: 'rounded,#b5342185',
    qrDot: 'rounded,#42184a',
    socials: [{ key: 'discord', value: 'testing' }],
    socialsEnabled: true
};

(async () => {
    const convertSvg = async (svg: string): Promise<Buffer> => {
        const result = await convert(svg, {
            output: 'doesnt_matter.jpg',
            width: size,
            height: size
        });

        return result;
    };

    const size = 2048;
    const ratio = size / 512;
    const handle = 'bigirishlion';

    const input = {
        handle,
        size,
        ratio,
        options,
        disableDollarSymbol: false
    };

    const handleSvg = new HandleSvg(input);
    const svg = handleSvg.build();

    const result = await convertSvg(svg);

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
            ${svg}
        </body>
        <script>
            const options = ${JSON.stringify(options)}
            const size = ${size}
            const ratio = ${ratio}
            const [dotType, dotColor] = options.qrDot.split(",");
            const [innerEyeType, innerEyeColor] = options.qrInnerEye.split(",");
            const [outerEyeType, outerEyeColor] = options.qrOuterEye.split(",");
            const qrCode = new QRCodeStyling({
                width: size ? ratio * 105 : 512,
                height: size ? ratio * 105 : 512,
                type: "svg",
                data: "http://handle.me/${handle}",
                dotsOptions: {
                    color: dotColor || "#000000",
                    type: dotType
                },
                cornersSquareOptions: {
                    color: outerEyeColor || "#000000",
                    type: outerEyeType === 'rounded' ? 'extra-rounded' : outerEyeType
                },
                cornersDotOptions: {
                    color: innerEyeColor || "#000000",
                    type: innerEyeType
                },
                backgroundOptions: {
                    color: options.qrBgColor || "#FFFFFF",
                },
            });
    
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
