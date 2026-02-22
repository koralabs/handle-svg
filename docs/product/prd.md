# handle-svg PRD

## Summary
`@koralabs/handle-svg` is the rendering package for Handle profile visuals. It assembles SVG output from handle metadata, theme options, profile images, social links, and optional OG labels.

## Problem
Handle consumers need deterministic image rendering logic that:
- Produces consistent visuals for different option combinations.
- Supports image and font sources from IPFS/HTTP.
- Keeps text and icon elements readable against diverse backgrounds.
- Works in server-side environments without browser rendering dependencies.

## Users
- Handle API/runtime services that generate SVG images.
- Internal scripts rendering local previews for development.
- Downstream projects that import `HandleSvg` and utility helpers.

## Goals
- Build complete SVG output for handle profile cards and handle-name overlays.
- Support option-driven customization without requiring client-side layout code.
- Provide graceful fallback behavior for fonts and IPFS gateways.
- Keep package usage simple via a single class entrypoint plus utility exports.

## Non-Goals
- Client-side animation runtime.
- Image rasterization pipeline (outside SVG string generation).
- Full social/link validation semantics.

## Functional Requirements

### Core Rendering
- Expose default `HandleSvg` class as package entrypoint.
- Accept:
  - `handle`,
  - `size`,
  - `options`,
  - optional `disableDollarSymbol`.
- Compose SVG sections:
  - background and optional background image,
  - profile image mask/border block,
  - text ribbon and border,
  - rarity/dollar marker,
  - OG label text,
  - social icon markup.

### Readability and Layout Safety
- Validate color contrast for key elements and apply fallback contrast colors when needed.
- Enforce profile image offset bounds relative to zoom level.
- Select font sizing and placement based on handle length and font metrics.

### External Asset Handling
- Resolve IPFS asset URLs through fallback gateway list.
- Retry fetches across gateways when image loads fail.
- Optionally return image references as base64 data URIs.
- Decompress `woff2` fonts before parsing when required.

## Success Criteria
- Utility tests and guardrail script maintain >=90% line and branch coverage.
- `npm test` and `./test_coverage.sh` pass locally.
- Product/spec docs stay linked from README and docs index.
