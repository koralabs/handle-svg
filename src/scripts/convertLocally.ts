import * as fs from 'fs';
import https from 'https';
import { xml2json, json2xml } from 'xml-js';
import { decompress } from 'wawoff2';
import { IHandleSvg } from '../interfaces';
import opentype from 'opentype.js';
import HandleSvg from '../HandleSvg';
import { IHandleSvgOptions } from '@koralabs/handles-public-api-interfaces';

import { JSDOM } from 'jsdom';

import 'node-self';
global.window = new JSDOM().window as any;
global.self = global.window;
global.document = global.window.document;
global.XMLSerializer = global.window.XMLSerializer;
global.Image = global.window.Image;

import QRCodeStyling from 'qr-code-styling-node';
import sharp from 'sharp';

const options: IHandleSvgOptions = {
    font_shadow_color: '0x000000',
    font_color: '0xffffff',
    // font: 'ShortStackMod,https://claynation.nyc3.cdn.digitaloceanspaces.com/ada_handles/ShortStackNew.ttf',
    // font: 'ShortStack,https://claynation.nyc3.cdn.digitaloceanspaces.com/ada_handles/ShortStack.ttf',
    // font: 'times new roman,https://fonts.cdnfonts.com/s/57197/times.woff',
    // font: 'Ubuntu Mono,https://fonts.gstatic.com/s/ubuntumono/v15/KFOjCneDtsqEr0keqCMhbCc6CsQ.woff2',
    // font: 'Poppins,https://fonts.gstatic.com/s/poppins/v20/pxiEyp8kv8JHgFVrJJfecg.woff2',
    font: 'https://derp.link/barlow-black-italic-derp.woff',
    text_ribbon_colors: ['0x15445466'],
    //pfp_image: 'ipfs://QmY3uZmaBrWiCAisREsKMwhJyaDXSUxk5PiC6hVoVLW1iP',
    pfp_image: 'ipfs://QmZYtTq2aiQond3ZyDK4uzTLD1zz269JfSJoEWCfoxREPa',
    pfp_zoom: 150,
    pfp_offset: [-135, 0],
    pfp_border_color: '0x3992b011',
    // bg_image: 'ipfs://QmQB24x3XyWVofvbd3qYXNB4icJTcBgPmtYXEcuEpMF1Fs',
    // bg_image: 'https://koralabs-public.s3.amazonaws.com/marketing/pz_designer_layout.png',
    bg_image: 'ipfs://QmPdwMizqJ5NnqvhdiWLzHdXdWuQREkuGnx14QGLCz4gNx',
    bg_border_color: '0x797985',
    bg_color: '0xbe4961',
    qr_link: 'https://handle.me/bigirishlion',
    //qr_image: 'https://derp.link/derp-icon.svg',
    //qr_image: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg',
    qr_image: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/ad/FedEx_Ground.svg/2560px-FedEx_Ground.svg.png',
    qr_bg_color: '0xBA000000',
    qr_inner_eye: 'square,#FFFFFF',
    qr_outer_eye: 'rounded,#0cd25b99',
    qr_dot: 'rounded,#FFFFFF',
    socials: [
        // { display: '!@#$%^&*()bjm', url: 'https://telegram.com/testing' },
        // { display: '-=_+[]{}    \\	|;\':"', url: 'https://whatsapp.com/testing' },
        // { display: ',./<>?6Me4G', url: 'https://reddit.com/testing' }
        { display: '@personalized.handles', url: 'https://twitter.com/personalized' },
        { display: 'personazlize-this', url: 'https://facebook.com/personalized' },
        { display: '@$personalized', url: 'https://discord.gg/personalized' }
    ],
    font_shadow_size: [-5, 7, 5],
    og_number: 2438
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
        // const handle = 'mmw5j7h0gqklwmm';
        // const handle = 'jlg';
        // const handle = '1lnternetz';
        // const handle = 'w00di';
        // const handle = '0o1lijt2z5s8b';
        // const handle = 'b_.-mj';
        const handle = '0o1lijt2z5s8@0o1lijt2z5s8';
        // 0ctopus, 1nternet lnternet

        const input: IHandleSvg = {
            handle,
            disableDollarSymbol: false,
            size,
            options
        };

        const handleSvg = new HandleSvg(input, https);
        const svg = await handleSvg.build(decompress, JSDOM, QRCodeStyling, opentype, xml2json, json2xml);
        const buffer = await sharp(Buffer.from(svg), {unlimited: true, limitInputPixels: false}).jpeg().toBuffer();

        // write jpg
        fs.writeFile('test_svg.jpg', buffer, (err: any) => {
            // throws an error, you could also catch it here
            if (err) throw err;

            // success case, the file was saved
            console.log('JPG written!');
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
            width: 435px;
            height: 2px;
            background: red;
            top: 1075px;
            left: 811px;
        "></div>
        <div style="
            position: absolute;
            width: 435px;
            height: 1px;
            background: red;
            top: 1024px;
            left: 811px;
        "></div>
        <div style="
            position: absolute;
            width: 435px;
            height: 1px;
            background: red;
            top: 973px;
            left: 811px;
        "></div>
        <div style="
            position: absolute;
            width: 1px;
            height: 130px;
            background: red;
            position: absolute;
            top: 960;
            left: 1024px;
        "></div>
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
    } catch (error) {
        console.error('ERROR:', error);
    }
})();
