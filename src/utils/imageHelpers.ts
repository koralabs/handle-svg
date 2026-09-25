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

// Time budget for resolving ONE image. render.handle.me runs as a 30s function, and a lapsed IPFS pin
// makes a gateway HANG rather than fail fast. A fixed 15s per fetch let Filebase + Pinata use the
// whole 30s, so the function was killed before the NFTCDN recovery ran (mainnet recovery measured
// 15-19s with only one gateway hanging). So the gateway walk SHARES one budget, the NFTCDN recovery
// gets its own, and every fetch (headers AND body) must finish inside its slice. HandleSvg fetches
// bg and pfp concurrently, so a whole render spends at most IMAGE_FETCH_BUDGET_MS on images.
export const IPFS_GATEWAY_BUDGET_MS = 12_000;
export const NFTCDN_FETCH_TIMEOUT_MS = 8_000;
export const IMAGE_FETCH_BUDGET_MS = IPFS_GATEWAY_BUDGET_MS + NFTCDN_FETCH_TIMEOUT_MS;

// Rate limits: a gateway that answers 429/503 with Retry-After is not called again (by any render in
// this process) until that time; the walk skips it and moves on to the next tier.
const blockedUntil = new Map<string, number>();
const retryAfterMs = (value: string | null): number | undefined => {
    if (!value) return undefined;
    const seconds = Number(value);
    if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
    const date = Date.parse(value);
    return Number.isNaN(date) ? undefined : Math.max(0, date - Date.now());
};
const isBlocked = (url: string) => (blockedUntil.get(new URL(url).host) ?? 0) > Date.now();
const rememberRateLimit = (url: string, response: Response) => {
    if (response.status !== 429 && response.status !== 503) return;
    const wait = retryAfterMs(response.headers.get('retry-after'));
    if (wait !== undefined) blockedUntil.set(new URL(url).host, Date.now() + wait);
};

type ImageResult = { contentType: string; base64: string; imageUrl: string };

// Fetch one image within timeoutMs. The abort covers reading the body too, so a gateway that sends
// headers and then stalls cannot outlive its slice. Rejects on timeout, network error, or !ok.
const fetchImage = async (url: string, timeoutMs: number, useBase64: boolean): Promise<ImageResult> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
            rememberRateLimit(url, response);
            throw new Error(`Failed to fetch image from ${url}`);
        }
        const contentType = response.headers.get('content-type') || '';
        if (!useBase64) return { imageUrl: url, contentType, base64: '' };
        const data = await response.arrayBuffer();
        return { imageUrl: url, contentType, base64: Buffer.from(data).toString('base64') };
    } finally {
        clearTimeout(timer);
    }
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
    const urls = imageUrl.startsWith('ipfs://')
        ? ALL_IPFS_GATEWAYS.slice(gatewayIndex).map((_, i) => buildFallbackUrl(imageUrl, gatewayIndex + i))
        : [imageUrl];
    const deadline = Date.now() + IPFS_GATEWAY_BUDGET_MS;

    let lastError: Error = new Error(`Failed to fetch image from ${urls[urls.length - 1]}`);
    for (let i = 0; i < urls.length; i++) {
        const remaining = deadline - Date.now();
        if (remaining <= 0) break;
        if (isBlocked(urls[i])) continue;
        try {
            // Split what is left of the budget across the gateways not yet tried.
            return await fetchImage(urls[i], remaining / (urls.length - i), useBase64);
        } catch (error) {
            lastError = error as Error;
        }
    }

    // Final recovery tier. NFTCDN caches Cardano NFT media by CIP-14 fingerprint independent of the
    // original IPFS pin, so it recovers images whose project pins have lapsed. The URL is pre-signed
    // by the caller (server-side — signing needs the NFTCDN gateway secret). No URL ⇒ no recovery.
    if (!nftcdnUrl || isBlocked(nftcdnUrl)) throw lastError;
    try {
        return await fetchImage(nftcdnUrl, NFTCDN_FETCH_TIMEOUT_MS, useBase64);
    } catch {
        throw lastError; // NFTCDN unreachable/timed out — surface the original gateway failure.
    }
};
