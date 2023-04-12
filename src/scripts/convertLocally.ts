import { convert } from 'convert-svg-to-jpeg';
import * as fs from 'fs';
import { IHandleSvgOptions } from '../interfaces';
import { build } from '../HandleSvg';

const options = {
    handleTextShadowColor: '#475081',
    handleTextShadowColorEnabled: true,
    handleTextBgColor: '#42184a',
    handleTextBgColorEnabled: true,
    pfpImageUrl: 'https://live.staticflickr.com/6060/6999428845_38db1486d5_k.jpg',
    pfpImageUrlEnabled: false,
    pfpBorderColor: '#202341',
    pfpBorderColorEnabled: true,
    backgroundImageUrl: 'https://live.staticflickr.com/6060/6999428845_38db1486d5_k.jpg',
    backgroundImageUrlEnabled: false,
    backgroundBorderColor: '#797986',
    backgroundBorderColorEnabled: true,
    backgroundColor: '#be4961',
    backgroundColorEnabled: true,
    qrEnabled: true,
    qrColor: '#894480',
    qrColorEnabled: true,
    socials: [{ key: 'discord', value: 'testing' }],
    socialsEnabled: true
};

(async () => {
    const convertSvg = async ({
        handle,
        size,
        outputFile,
        options
    }: {
        handle: string;
        size: number;
        outputFile: string;
        options: IHandleSvgOptions;
    }): Promise<Buffer> => {
        const ratio = size / 512;
        const result = await convert(build({ handle, size, ratio, options }), {
            output: outputFile,
            width: size,
            height: size
        });

        return result;
    };

    const result = await convertSvg({ handle: 'test', size: 2048, outputFile: 'testSVG-1.jpg', options });
    fs.writeFile('testSVG-1.jpg', result, (err: any) => {
        // throws an error, you could also catch it here
        if (err) throw err;

        // success case, the file was saved
        console.log('SVG written!');
    });
})();
