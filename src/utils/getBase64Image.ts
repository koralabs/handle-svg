import https from 'https';

export const getBase64Image = async (imageUrl: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        let data: Uint8Array = new Uint8Array();
        const post_req = https.get(imageUrl, (res) => {
            const contentType = res.headers['content-type'];
            res.on('data', (chunk) => {
                const tempData = new Uint8Array(data);
                data = new Uint8Array(data.length + chunk.length);
                data.set(tempData);
                data.set(chunk, tempData.length);
            });
            res.on('error', (err) => {
                reject(err);
            });
            res.on('end', () => {
                resolve(`data:${contentType};base64,${Buffer.from(data).toString('base64')}`);
            });
        });
        post_req.end();
    });
};
