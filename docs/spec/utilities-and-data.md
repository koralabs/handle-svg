# Utilities and Data

## Constants (`src/utils/constants.ts`)

| Constant | Purpose |
| --- | --- |
| `OG_TOTAL` | Denominator used for OG label rendering |
| `IPFS_GATEWAY` | Primary gateway for `ipfs://` resources |
| `PINATA_GATEWAY_TOKEN` | Token for Pinata gateway query param |
| `ALL_IPFS_GATEWAYS` | Ordered fallback gateway list |

## Utility Contracts

### `checkContrast`
- Input: two hex colors + optional acceptable ratio.
- Output: boolean indicating if contrast ratio exceeds threshold.
- Supports alpha channels in hex values.

### `getMaxOffset`
- Input: profile image zoom.
- Output: max allowed x/y offset magnitude for the zoom level.

### `getSocialIcon`
- Input: social URL string, scale, x/y, optional fill.
- Output: SVG snippet string matching known platform patterns, fallback globe icon otherwise.

### `getFontArrayBuffer`
- Input: font URL and async decompress function.
- Behavior:
  - fetch raw font bytes,
  - detect `woff2` via content type/path,
  - decompress when required,
  - return `ArrayBuffer`.

### `getImageDetails`
- Input: image URL, `useBase64` flag, optional gateway index.
- Behavior:
  - resolve IPFS URL through gateway list,
  - fetch and retry on failure,
  - return `{ imageUrl, contentType, base64 }`,
  - throw on terminal failure.
