import fs from 'fs';
import canvas from 'canvas';
import domToImage from 'dom-to-image';
import * as htmlToImage from 'html-to-image';
import { JSDOM } from 'jsdom';

global.window = new JSDOM().window as any;
global.self = global.window;
global.document = global.window.document;
global.XMLSerializer = global.window.XMLSerializer;
global.HTMLElement = global.window.HTMLElement;
global.HTMLCanvasElement = global.window.HTMLCanvasElement;
global.Element = global.window.Element;
global.HTMLImageElement = global.window.HTMLImageElement;
global.Image = global.window.Image;
global.HTMLVideoElement = global.window.HTMLVideoElement;
global.HTMLIFrameElement = global.window.HTMLIFrameElement;
global.HTMLTextAreaElement = global.window.HTMLTextAreaElement;
global.HTMLInputElement = global.window.HTMLInputElement;
global.HTMLSelectElement = global.window.HTMLSelectElement;
global.SVGImageElement = global.window.SVGImageElement;

// function makeImage(uri: string) {
//     return new Promise(function (resolve, reject) {
//         var image = new Image();
//         image.onload = function () {
//             resolve(image);
//         };
//         image.onerror = reject;
//         image.src = uri;
//     });
// }

(async () => {
    const canvasz = canvas.createCanvas(2048, 2048);
    const ctx = canvasz.getContext('2d');
    const image = await canvas.loadImage(
        'https://public-handles.myfilebase.com/ipfs/QmQB24x3XyWVofvbd3qYXNB4icJTcBgPmtYXEcuEpMF1Fs'
    );
    ctx.drawImage(image, 0, 0, 2048, 2048);
    const dataUri = canvasz.toDataURL();

    const dom = new JSDOM();
    dom.window.document.body.innerHTML = `<div><svg xmlns="http://www.w3.org/2000/svg" width="2048" height="2048"><foreignObject width="100%" height="100%"><div xmlns="http://www.w3.org/1999/xhtml"><img src="${dataUri}"/></div></foreignObject></svg></div>`;

    const result = await domToImage.toJpeg(dom.window.document.body.getElementsByTagName('div')[0]);
    console.log('result', result);
    //fs.writeFileSync('result.png', Buffer.from(arr));
})();
