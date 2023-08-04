import * as fs from 'fs';
import { decompress } from 'wawoff2';
import { IHandleSvg } from '../interfaces';
import HandleSvg from '../HandleSvg';
import { convert } from './convert';
import { IHandleSvgOptions } from '@koralabs/handles-public-api-interfaces';

import { JSDOM } from 'jsdom';

import 'node-self';
global.window = new JSDOM().window as any;
global.self = global.window;
global.document = global.window.document;
global.XMLSerializer = global.window.XMLSerializer;

import QRCodeStyling from 'qr-code-styling-node';

const options: IHandleSvgOptions = {
    font_shadow_color: '0x73000000',
    // font_color: '0xff6130',
    // font: 'ShortStack,https://claynation.nyc3.cdn.digitaloceanspaces.com/ada_handles/ShortStack.ttf',
    // font: 'times new roman,https://fonts.cdnfonts.com/s/57197/times.woff',
    // font: 'Ubuntu Mono,https://fonts.gstatic.com/s/ubuntumono/v15/KFOjCneDtsqEr0keqCMhbCc6CsQ.woff2',
    // font: 'Poppins,https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2',
    text_ribbon_colors: ['0x000000'],
    pfp_image: 'ipfs://QmY3uZmaBrWiCAisREsKMwhJyaDXSUxk5PiC6hVoVLW1iP',
    pfp_zoom: 120,
    pfp_offset: [-124, -58],
    pfp_border_color: '0x99bc54',
    bg_image: 'ipfs://QmQB24x3XyWVofvbd3qYXNB4icJTcBgPmtYXEcuEpMF1Fs', // https://koralabs-public.s3.amazonaws.com/marketing/pz_designer_layout.png
    bg_border_color: '0x99bc54',
    bg_color: '0xbe4961',
    qr_link: 'https://handle.me/bigirishlion',
    qr_image: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    qr_bg_color: '0xBA000000',
    qr_inner_eye: 'square,#FFFFFF',
    qr_outer_eye: 'square,#FFFFFF',
    qr_dot: 'rounded,#8dff40',
    socials: [
        { display: 'telegram', url: 'https://telegram.com/testing' },
        { display: 'whatsapp', url: 'https://whatsapp.com/testing' },
        { display: 'reddit', url: 'https://reddit.com/testing' }
    ],
    font_shadow_size: [-5, 7, 5]
    // og_number: 2438
};

// const options: IHandleSvgOptions = {
//     font_shadow_color: '0x000000',
//     font_color: '0xffffff',
//     pfp_image: 'ipfs://QmY3uZmaBrWiCAisREsKMwhJyaDXSUxk5PiC6hVoVLW1iP',
//     pfp_border_color: '0x99bc54',
//     bg_border_color: '0x99bc54',
//     bg_color: '0xf4900c',
//     qr_link: 'https://handle.me/bigirishlion',
//     qr_image: 'https://koralabs-public.s3.amazonaws.com/marketing/pz_designer_layout.png',
//     qr_bg_color: '0xBA000000',
//     qr_inner_eye: 'square,#FFFFFF',
//     qr_outer_eye: 'square,#FFFFFF',
//     qr_dot: 'rounded,#8dff40',
//     socials: [
//         { display: 'telegram', url: 'https://telegram.com/testing' },
//         { display: 'whatsapp', url: 'https://whatsapp.com/testing' },
//         { display: 'reddit', url: 'https://reddit.com/testing' }
//     ],
//     font_shadow_size: [1, 1, 6]
//     // text_ribbon_colors: ['0xffffff']
// };

(async () => {
    console.log('STARTED!');
    try {
        const size = 2048;
        //const handle = 'mmw5j7h0gqklwmm';
        // const handle = '1lnternetz';
        // const handle = 'w00di';
        const handle = '0o1lijt2z5s8b';
        // 0ctopus, 1nternet lnternet

        const input: IHandleSvg = {
            handle,
            disableDollarSymbol: true,
            size,
            options
        };

        const handleSvg = new HandleSvg(input);

        const result = await convert(handle, handleSvg, size, decompress, JSDOM, QRCodeStyling);

        // write jpg
        fs.writeFile('test_svg.jpg', result, (err: any) => {
            // throws an error, you could also catch it here
            if (err) throw err;

            // success case, the file was saved
            console.log('JPG written!');
        });

        const svgString = await handleSvg.build(decompress, JSDOM, QRCodeStyling).catch((err) => {
            console.error(err);
        });

        const html = `
    <html>
        <head>
            <title>${handle} SVG</title>
            <script type="text/javascript" src="https://unpkg.com/wawoff2@2.0.1/build/decompress_binding.js"></script>
        </head>
        <body style="margin: 0; padding: 0;">
        <div style="
            position: absolute;
            width: 16px;
            height: 91px;
            background: red;
            position: absolute;
            top: 1091px;
            left: 855px;
        "></div>
            ${svgString}
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
    } catch (error) {
        console.error('ERROR:', error);
    }

    console.log('IM DONE YO!');
})();
