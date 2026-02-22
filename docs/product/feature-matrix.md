# Feature Matrix

| Area | Capability | Module |
| --- | --- | --- |
| Entry API | Default class export for SVG generation | `src/index.ts`, `src/HandleSvg.ts` |
| Background rendering | Solid/default circuit/background-image layers | `HandleSvg.buildBackground*` |
| Profile image rendering | Circular clipping, zoom, offset, border | `HandleSvg.buildPfpImage*` |
| Text rendering | Handle/OG text path generation and alignment | `HandleSvg.buildHandleName`, `HandleSvg.buildOG` |
| Social rendering | Social icon SVG snippets by URL pattern | `src/utils/getSocialIcon.ts` |
| Font loading | Font fetch + woff2 decompression support | `src/utils/getFontArrayBuffer.ts` |
| IPFS image fallback | Gateway retry + optional base64 response | `src/utils/imageHelpers.ts` |
| Contrast helpers | Color contrast checks and defaults | `src/utils/checkContrast.ts` |
