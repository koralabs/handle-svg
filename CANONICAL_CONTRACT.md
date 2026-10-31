# handle-svg canonical contract

## Purpose and authority

I render the SVG image of a Handle from its on-chain datum values. My output is what holders and marketplaces see as the Handle, so it must match the chain data. I am published to npm as `@koralabs/handle-svg` from `.github/workflows/deploy.yml`; render.handle.me and the front ends consume me.


This file and `.enclave` are the operator's gate: a PR that changes any path listed in `.enclave` and merges into `master` needs the operator's approval. Nothing here authorizes signing, spending, minting, burning or editing on-chain contracts or settings. Ecosystem rules (addresses correct 100% of the time, never double-mint, chain-accurate properties) are in the koralabs root `AGENTS.md`.

## Invariants (must never be violated)

1. **The image shows exactly the handle and datum values given.** The handle text, its rarity colour (Legendary 1 character, Ultra Rare 2, Rare 3, Common 4-7, Basic 8+; a subhandle takes its root handle's colour) and OG number come only from the input. Enforced by `tests/rarity-subhandle.test.cjs`, `tests/utils-index.test.cjs` and `tests/handle-svg.test.cjs`.
2. **A background or profile image that was provided must render or the render must fail.** I never silently drop it or draw a different one. Enforced by `tests/handle-svg-required-images.test.cjs`. When no image is provided, the layer is empty and nothing throws.
3. **Image sources are only Kora's own IPFS gateways, then the caller's signed NFTCDN URL.** No public gateway. Enforced by the "walks only Kora gateways" test in `tests/image-fetch-recovery.test.cjs`.
4. **Image fetching stays inside its time budget (20 seconds per render) and obeys rate limits.** A gateway that answers 429 or 503 with `Retry-After` is not called again, by any render in the process, before the stated time. Enforced by `tests/image-fetch-budget.test.cjs` and `tests/image-fetch-recovery.test.cjs`.
5. **Out-of-range inputs fail loudly.** Profile-picture offsets beyond the zoom bounds and font-shadow values outside -20..20 (blur 0..20) throw; I never clamp them to something that looks valid. Enforced in `tests/handle-svg.test.cjs`.
6. **Unreadable colours are swapped for a readable default**, never rendered invisible (contrast checks). Enforced in `tests/handle-svg.test.cjs` and `tests/utils.test.cjs`.
7. **No secrets in this repo.** NOT YET TRUE: `src/utils/constants.ts` ships a default `PINATA_GATEWAY_TOKEN` value in source. No test enforces this invariant.
8. **Only the deploy workflow publishes, and only a new version.** npm publish happens from `.github/workflows/deploy.yml` using OIDC, runs lint, tests and build first, and skips a version already on npm. No test; this is a workflow property.

## Boundaries and known limits

- Handle names are placed into SVG text without an explicit escaping step in this repo; I rely on handle names being validated by the minting side. Not tested here.
- Font and glyph fallback (Ubuntu Mono) is allowed by design; it changes looks, not the handle text.
- I do not read the chain. Whether the datum values passed in are correct is the caller's responsibility (render.handle.me, the indexer).

## Refactors needed to enforce this

- Remove the default Pinata token from `src/utils/constants.ts`, require it from the environment, rotate the exposed token, then add a test or gate that fails on a committed token (invariant 7).
- Add a test that the rendered text equals the handle for tricky characters (invariant 1) and a test for XML-special characters.
- Add a test or lint gate that the deploy workflow still runs lint, tests and build before publish (invariant 8).
