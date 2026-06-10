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
    const isIpfs = imageUrl.startsWith('ipfs://');
    const url = isIpfs ? buildFallbackUrl(imageUrl, gatewayIndex) : imageUrl;
    const hasMoreGateways = isIpfs && gatewayIndex < ALL_IPFS_GATEWAYS.length - 1;

    let result: Response;
    try {
        result = await fetch(url);
    } catch (error) {
        // Gateway errored (network/DNS/timeout) — try the next IPFS gateway before failing.
        if (hasMoreGateways) {
            return getImageDetails({ imageUrl, useBase64, gatewayIndex: gatewayIndex + 1 });
        }
        throw error;
    }

    if (!result.ok) {
        if (hasMoreGateways) {
            return getImageDetails({ imageUrl, useBase64, gatewayIndex: gatewayIndex + 1 });
        }
        throw new Error(`Failed to fetch image from ${url}`);
    }

    const contentType = result.headers.get('content-type');

    if (!useBase64) {
        return { imageUrl: url, contentType: contentType || '', base64: '' };
    }

    const data = await result.arrayBuffer();

    return { imageUrl: url, contentType: contentType || '', base64: Buffer.from(data).toString('base64') };
};
