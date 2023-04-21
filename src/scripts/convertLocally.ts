import * as fs from 'fs';
import { IHandleSvgOptions } from '../interfaces';
import { build } from '../HandleSvg';
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
    qrBgColor: '#894480',
    qrEyeColor: '',
    qrEyeColorEnabled: false,
    qrDotColor: '',
    qrDotColorEnabled: false,
    qrBgColorEnabled: true,
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

    const input = {
        handle: 'bigirishlion',
        size,
        ratio,
        options,
        disableDollarSymbol: false
    };

    const svg = build(input);

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
            <title>Test</title>
        </head>
        <body style="margin: 0; padding: 0;">
            ${svg}
        </body>
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
