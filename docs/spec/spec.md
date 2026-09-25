# Technical Spec

## Architecture

### Primary Exports
- Default export:
  - `HandleSvg` class (`src/HandleSvg.ts`)
- Named exports:
  - interfaces + utility helpers (`src/index.ts`)

### HandleSvg Responsibilities
- Store normalized render params (`size`, `handle`, `disableDollarSymbol`) and options.
- Generate SVG fragments for:
  - logo/header elements,
  - background and circuit overlay,
  - optional background image,
  - optional PFP image and border mask,
  - text ribbon and border,
  - dollar marker and rarity styles,
  - OG text section.
- Compose handle-name text paths using parsed font metrics.

## External Dependencies
- `@koralabs/kora-labs-common` for option/type definitions.
- `cross-fetch` for asset and font fetch behavior.
- `opentype.js` (consumer-side in scripts) for path parsing in text rendering.
- optional `wawoff2` decompressor path via injected function.

## Error and Fallback Behavior
- Font parsing:
  - if custom font fetch/parse fails, fallback to Ubuntu Mono.
- Image fetching:
  - retry across configured IPFS gateways (Filebase, then Pinata), then the caller's signed NFTCDN URL.
  - time budget per image: the gateway walk shares `IPFS_GATEWAY_BUDGET_MS` (12s, split across the
    gateways not yet tried), NFTCDN gets `NFTCDN_FETCH_TIMEOUT_MS` (8s); each timeout covers headers
    and body. `build()` fetches bg and pfp concurrently, so images cost at most `IMAGE_FETCH_BUDGET_MS`
    (20s) of render.handle.me's 30s function timeout.
  - a gateway answering 429/503 with `Retry-After` is skipped by every render in the process until then.
  - throw when all tiers fail.
- PFP positioning:
  - throw if provided offsets exceed zoom-derived bounds.
- Contrast:
  - swap to default contrast color when configured color contrast is too low.

## Build and Runtime
- TypeScript source in `src/*`.
- Compiled distribution in `lib/*`.
- Local scripts:
  - `src/scripts/renderLocally.ts`
  - `src/scripts/renderHandleNameLocally.ts`

## Testing and Coverage
- Test suite targets deterministic utility logic:
  - `checkContrast`,
  - `getMaxOffset`,
  - `imageHelpers`.
- Commands:
  - `npm test`
  - `./test_coverage.sh`
