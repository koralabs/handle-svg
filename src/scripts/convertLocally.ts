import * as fs from 'fs';
import { IHandleSvg } from '../interfaces';
import HandleSvg from '../HandleSvg';
import { convert } from './convert';
import { IHandleSvgOptions } from '@koralabs/handles-public-api-interfaces';

// const options: IHandleSvgOptions = {
//     font_shadow_color: '0x73000000',
//     // font_color: '0xff6130',
//     font: 'ShortStack,https://claynation.nyc3.cdn.digitaloceanspaces.com/ada_handles/ShortStack.ttf',
//     text_ribbon_colors: ['0xa699bc54', '0xa6000000', '0xa6ff8906'],
//     text_ribbon_gradient: 'radial',
//     pfp_image: 'ipfs://QmY3uZmaBrWiCAisREsKMwhJyaDXSUxk5PiC6hVoVLW1iP',
//     pfp_zoom: 120,
//     pfp_offset: [-124, -58],
//     pfp_border_color: '0x99bc54',
//     bg_image: 'ipfs://QmQB24x3XyWVofvbd3qYXNB4icJTcBgPmtYXEcuEpMF1Fs', // https://koralabs-public.s3.amazonaws.com/marketing/pz_designer_layout.png
//     bg_border_color: '0x99bc54',
//     bg_color: '0xbe4961',
//     qr_link: 'https://handle.me/bigirishlion',
//     // qr_image: 'https://koralabs-public.s3.amazonaws.com/marketing/pz_designer_layout.png',
//     qr_bg_color: '0xBA000000',
//     qr_inner_eye: 'square,#FFFFFF',
//     qr_outer_eye: 'square,#FFFFFF',
//     qr_dot: 'rounded,#8dff40',
//     socials: [
//         { display: 'telegram', url: 'https://telegram.com/testing' },
//         { display: 'whatsapp', url: 'https://whatsapp.com/testing' },
//         { display: 'reddit', url: 'https://reddit.com/testing' }
//     ],
//     font_shadow_size: [-5, 7, 5]
//     // og_number: 2438
// };

const options: IHandleSvgOptions = {
    font_shadow_color: '0x000000',
    font_color: '0xffffff',
    pfp_image: 'ipfs://QmY3uZmaBrWiCAisREsKMwhJyaDXSUxk5PiC6hVoVLW1iP',
    pfp_border_color: '0x99bc54',
    bg_border_color: '0x99bc54',
    bg_color: '0xf4900c',
    qr_link: 'https://handle.me/bigirishlion',
    qr_image: 'https://koralabs-public.s3.amazonaws.com/marketing/pz_designer_layout.png',
    qr_bg_color: '0xBA000000',
    qr_inner_eye: 'square,#FFFFFF',
    qr_outer_eye: 'square,#FFFFFF',
    qr_dot: 'rounded,#8dff40',
    socials: [
        { display: 'telegram', url: 'https://telegram.com/testing' },
        { display: 'whatsapp', url: 'https://whatsapp.com/testing' },
        { display: 'reddit', url: 'https://reddit.com/testing' }
    ],
    font_shadow_size: [1, 1, 6]
    // text_ribbon_colors: ['0xffffff']
};

(async () => {
    const size = 2048;
    const handle = 'lq'; //'0Oo1lijt2z5s8b';
    // 0ctopus, 1nternet lnternet

    const input: IHandleSvg = {
        handle,
        size,
        options
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

    const svgString = await handleSvg.build().catch((err) => {
        console.error(err);
    });

    const html = `
    <html>
        <head>
            <title>${handle} SVG</title>
            <script type="text/javascript" src="https://unpkg.com/qr-code-styling@1.5.0/lib/qr-code-styling.js"></script>
            <script type="text/javascript" src="https://unpkg.com/wawoff2@2.0.1/build/decompress_binding.js"></script>
        </head>
        <body style="margin: 0; padding: 0;">
            ${svgString}
        </body>
        <script>
            const qrCode = new QRCodeStyling(${JSON.stringify(handleSvg.buildQrCodeOptions())});
            qrCode.append(document.getElementById("qr_code_${handle}"));

            // setTimeout(() => {
            //     const umm = document.getElementById("handle_name_${handle}");
            //     const ummWidth = umm.getBBox().width;
            //     umm.setAttribute('viewBox', '0 0 ' + (ummWidth + 200) + ' 2048' );
            //     console.log('UMM_WIDTH', ummWidth);
            // }, 100);
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
