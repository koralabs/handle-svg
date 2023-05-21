import * as fs from 'fs';
import { IHandleSvg } from '../interfaces';
import HandleSvg from '../HandleSvg';
import { convert } from './convert';
import { IHandleSvgOptions } from '@koralabs/handles-public-api-interfaces';

const options: IHandleSvgOptions = {
    font_shadow_color: '#cccccc',
    font_color: '#ff6130',
    font: 'Tilt Prism,https://tinyurl.com/2an5pb5a',
    text_ribbon_colors: ['#000000', '#12546294'],
    text_ribbon_gradient: 'radial',
    pfp_image: 'ipfs://QmY3uZmaBrWiCAisREsKMwhJyaDXSUxk5PiC6hVoVLW1iP',
    pfp_zoom: 1.5,
    pfp_offset: [-120, -50],
    pfp_border_color: '#202341',
    bg_image: 'ipfs://QmSkgqaCapgw99Y2oAZ72tj9iGRb89DzM7kJPetvsj7NND',
    bg_border_color: '#797986',
    bg_color: '#be4961',
    qr_link: 'https://handle.me/bigirishlion',
    qr_bg_color: '#00000000',
    qr_inner_eye: 'square,#f2f285',
    qr_outer_eye: 'rounded,#f2f285',
    qr_dot: 'rounded,#ff6130',
    socials: [
        { display: 'discord', url: 'https://discord.gg/testing' },
        { display: 'facebook', url: 'https://facebook.com/testing' },
        { display: 'twitter', url: 'https://twitter.com/testing' }
    ],
    og_number: 2438
};

(async () => {
    const size = 2048;
    const handle = 'bigirishlion';

    const input: IHandleSvg = {
        handle,
        size,
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
