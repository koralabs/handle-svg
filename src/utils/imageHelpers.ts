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

type ImageResult = { contentType: string; base64: string; imageUrl: string };

const buildResult = async (url: string, response: Response, useBase64: boolean): Promise<ImageResult> => {
    const contentType = response.headers.get('content-type') || '';
    if (!useBase64) {
        return { imageUrl: url, contentType, base64: '' };
    }
    const data = await response.arrayBuffer();
    return { imageUrl: url, contentType, base64: Buffer.from(data).toString('base64') };
};

// Final recovery tier, tried only after every IPFS gateway has missed. NFTCDN caches Cardano NFT
// media by CIP-14 fingerprint independent of the original IPFS pin, so it recovers images whose
// project pins have lapsed. The URL is pre-signed by the caller (server-side — signing needs the
// NFTCDN gateway secret), so handle-svg only consumes it. No URL ⇒ no recovery, just rethrow.
const recoverViaNftcdn = async (
    nftcdnUrl: string | undefined,
    useBase64: boolean,
    gatewayError: Error
): Promise<ImageResult> => {
    if (!nftcdnUrl) throw gatewayError;
    const recovered = await fetch(nftcdnUrl);
    if (!recovered.ok) throw gatewayError;
    return buildResult(nftcdnUrl, recovered, useBase64);
};

export const getImageDetails = async ({
    imageUrl,
    useBase64,
    gatewayIndex = 0,
    nftcdnUrl
}: {
    imageUrl: string;
    useBase64: boolean;
    gatewayIndex?: number;
    // Server-signed NFTCDN recovery URL for this asset; used only after the IPFS gateways miss.
    nftcdnUrl?: string;
}): Promise<ImageResult> => {
    const isIpfs = imageUrl.startsWith('ipfs://');
    const url = isIpfs ? buildFallbackUrl(imageUrl, gatewayIndex) : imageUrl;
    const hasMoreGateways = isIpfs && gatewayIndex < ALL_IPFS_GATEWAYS.length - 1;

    let result: Response;
    try {
        result = await fetch(url);
    } catch (error) {
        // Gateway errored (network/DNS/timeout) — try the next IPFS gateway, then NFTCDN, before failing.
        if (hasMoreGateways) {
            return getImageDetails({ imageUrl, useBase64, gatewayIndex: gatewayIndex + 1, nftcdnUrl });
        }
        return recoverViaNftcdn(nftcdnUrl, useBase64, error as Error);
    }

    if (!result.ok) {
        if (hasMoreGateways) {
            return getImageDetails({ imageUrl, useBase64, gatewayIndex: gatewayIndex + 1, nftcdnUrl });
        }
        return recoverViaNftcdn(nftcdnUrl, useBase64, new Error(`Failed to fetch image from ${url}`));
    }

    return buildResult(url, result, useBase64);
};
