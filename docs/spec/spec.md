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
  - retry across configured IPFS gateways.
  - throw when all gateways fail.
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
