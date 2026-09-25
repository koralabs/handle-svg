export const OG_TOTAL = 2438;
export const IPFS_GATEWAY = process.env.IPFS_GATEWAY || 'https://public-handles.myfilebase.com';
export const PINATA_GATEWAY_TOKEN =
    process.env.PINATA_GATEWAY_TOKEN ?? 'jUcUCZpgtJZkqidOgGgcBG-FLAKYG1zh_sRZxuL82rZHL5-Iky0YGQf85Z37PQzD';
// Kora's own gateways only. Both fetch any public CID, so a miss on both means the content is not
// retrievable (or is not an image); the caller's NFTCDN tier recovers lapsed Cardano NFT pins. The
// public https://ipfs.io tier was dropped: it rate-limits server traffic (429, Retry-After 900) and
// the renderer re-called it on every miss (#2113 follow-up).
export const ALL_IPFS_GATEWAYS = [IPFS_GATEWAY, 'https://public-handles.mypinata.cloud'];
