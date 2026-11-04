# handle-svg canonical contract

I render the SVG image of a Handle from its on-chain datum values (`@koralabs/handle-svg`); render.handle.me and the front ends consume me. I do not read the chain: the caller supplies the values.

1. **The image shows exactly the handle and datum values given.** Handle text, rarity colour (Legendary 1 character, Ultra Rare 2, Rare 3, Common 4-7, Basic 8+; a subhandle takes its root's colour) and OG number come only from the input.
2. **A provided background or profile image must render or the render fails.** It is never silently dropped or replaced; when none is provided the layer is empty and nothing throws.
3. **Image sources are only Kora's own IPFS gateways, then the caller's signed NFTCDN URL.** No public gateway.
4. **Image fetching stays inside 20 seconds per render,** and a gateway that answers 429 or 503 with `Retry-After` is not called again by any render in the process before the stated time.
5. **Out-of-range inputs fail loudly.** Profile-picture offsets beyond the zoom bounds and font-shadow values outside -20..20 (blur 0..20) throw, never clamp.
6. **Unreadable colours are swapped for a readable default,** never rendered invisible.
