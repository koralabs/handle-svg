export const getBase64Image = async (
    imageUrl: string,
    https: any
): Promise<{ contentType: string; base64: string }> => {
    return new Promise((resolve, reject) => {
        let data: Uint8Array = new Uint8Array();
        const post_req = https.get(imageUrl, (res: any) => {
            const contentType = res.headers['content-type'];
            res.on('data', (chunk: any) => {
                const tempData = new Uint8Array(data);
                data = new Uint8Array(data.length + chunk.length);
                data.set(tempData);
                data.set(chunk, tempData.length);
            });
            res.on('error', (err: any) => {
                reject(err);
            });
            res.on('end', () => {
                resolve({ contentType, base64: Buffer.from(data).toString('base64') });
            });
        });
        post_req.end();
    });
};

export function loadImage(url: string) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => reject(new Error(`Image failed to load from ${url}`));
        img.src = url;
    });
}
