import fetch from 'cross-fetch';
import { ALL_IPFS_GATEWAYS, PINATA_GATEWAY_TOKEN } from './constants';

const buildQueryString = (gateway: string) => {
    if (gateway.includes('pinata')) return `?pinataGatewayToken=${PINATA_GATEWAY_TOKEN}`;
    return '';
};

export const buildFallbackUrl = (imageUrl: string, gatewayIndex: number) => {
    const imagePath = imageUrl.replace(':/', '');
    const gateway = ALL_IPFS_GATEWAYS[gatewayIndex];
    const queryString = buildQueryString(gateway);
    return `${gateway}/${imagePath}${queryString}`;
};

export const getImageDetails = async ({
    imageUrl,
    useBase64,
    gatewayIndex = 0
}: {
    imageUrl: string;
    useBase64: boolean;
    gatewayIndex?: number;
}): Promise<{ contentType: string; base64: string; imageUrl: string }> => {
    const url = imageUrl.startsWith('ipfs://') ? buildFallbackUrl(imageUrl, gatewayIndex) : imageUrl;
    const result = await fetch(url);

    if (!result.ok) {
        if (gatewayIndex < ALL_IPFS_GATEWAYS.length - 1) {
            return getImageDetails({ imageUrl, useBase64, gatewayIndex: gatewayIndex + 1 });
        } else {
            throw new Error(`Failed to fetch image from ${url}`);
        }
    }

    const contentType = result.headers.get('content-type');

    if (!useBase64) {
        return { imageUrl: url, contentType: contentType || '', base64: '' };
    }

    const data = await result.arrayBuffer();

    return { imageUrl: url, contentType: contentType || '', base64: Buffer.from(data).toString('base64') };
};
