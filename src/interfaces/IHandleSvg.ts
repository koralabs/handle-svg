import { IHandleSvgOptions } from '@koralabs/kora-labs-common';

export interface IHandleSvg {
    handle: string;
    size: number;
    options: IHandleSvgOptions;
    disableDollarSymbol?: boolean;
    // Server-signed NFTCDN recovery URLs for the bg/pfp NFTs, used as the final image fallback when
    // the asset's IPFS pin has lapsed. Signing needs the NFTCDN gateway secret, so it stays
    // server-side in the caller (e.g. render.handle.me); handle-svg only consumes the pre-built URL.
    bg_image_nftcdn_url?: string;
    pfp_image_nftcdn_url?: string;
}
