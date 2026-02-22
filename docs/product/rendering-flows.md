# Rendering Flows

## Handle Card Flow
1. Construct `HandleSvg` with handle text, canvas size, and options.
2. Build background layers:
  - solid background color,
  - optional default circuit overlay,
  - optional background image.
3. Build profile image layer with clipping and optional border.
4. Build text ribbon and border overlays.
5. Build handle-name path and optional OG label text.
6. Build optional social icon rows using URL pattern matching.
7. Return final SVG string assembly.

## Image Fetch Flow
1. If URL is `ipfs://`, map it through current gateway.
2. Fetch image.
3. If fetch fails and more gateways remain, retry next gateway.
4. Return either:
  - direct URL + content type (`useBase64=false`), or
  - base64 payload + content type (`useBase64=true`).

## Font Flow
1. Fetch font resource.
2. Inspect content type/path for `woff2`.
3. Decompress when required.
4. Parse font and build glyph/path metrics for text rendering.
