const { convert } = require('convert-svg-to-jpeg');
import * as fs from 'fs';
import { IHandleSvgOptions } from '../interfaces';
import { build } from '../HandleSvg';

const options: IHandleSvgOptions = {
    fontShadowColor: '#475081',
    fontShadowColorEnabled: true,
    fontColor: '#202341',
    fontColorEnabled: true,
    fontUrl: 'https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;700&display=swap',
    textRibbonColors: ['#b5342185', '#42184a'],
    textRibbonColorEnabled: true,
    textRibbonGradient: 'linear-45',
    textRibbonGradientEnabled: true,
    pfpImageUrl: 'https://live.staticflickr.com/6060/6999428845_38db1486d5_k.jpg',
    pfpImageUrlEnabled: true,
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
    const convertSvg = async ({
        handle,
        size,
        outputFile,
        options,
        disableDollarSymbol = false
    }: {
        handle: string;
        size: number;
        outputFile: string;
        options: IHandleSvgOptions;
        disableDollarSymbol?: boolean;
    }): Promise<Buffer> => {
        const ratio = size / 512;
        const svg = build({ handle, size, ratio, options, disableDollarSymbol });
        console.log('SVG:', svg);
        const result = await convert(svg, {
            output: outputFile,
            width: size,
            height: size
        });

        return result;
    };

    const result = await convertSvg({
        handle: 'bigirishlion',
        size: 2048,
        outputFile: 'testSVG-1.jpg',
        options,
        disableDollarSymbol: false
    });
    fs.writeFile('testSVG-1.jpg', result, (err: any) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        console.log('SVG written!');
    });
})();
