# ADR-0003: 3D with React Three Fiber and procedural low-poly assets

**Status:** Proposed
**Date:** 2026-11-02
**Deciders:** AMT team

## Context
We want a premium-feeling 3D outpost. The team builds with Next.js/React. Claude can write 3D scene code but cannot sculpt binary meshes or paint textures. Target devices include school laptops.

## Decision
Use three.js through React Three Fiber and drei inside the Next.js app. Build most visuals procedurally (noise terrain, primitive-assembled low-poly models, GLSL effects) in a stylized diorama art direction. Add CC0 or NASA public-domain GLB models only for hero pieces, with licences logged.

## Options Considered

### Option A: React Three Fiber, procedural low-poly (chosen)
| Dimension | Assessment |
|---|---|
| Complexity | Medium |
| Cost | Free |
| Scalability | Runs well on modest GPUs with budgets |
| Team familiarity | Good (React) |

**Pros:** code-authorable by Claude; integrates with React state; light assets; coherent style.
**Cons:** not photoreal; needs discipline on performance.

### Option B: Raw three.js
**Pros:** less abstraction. **Cons:** imperative code clashes with the React app; slower iteration.

### Option C: Unity/Unreal WebGL export
**Pros:** high fidelity tooling. **Cons:** heavy downloads, poor fit for the web stack, cannot be authored as code by Claude, slow loading on school devices.

### Option D: 2D canvas/SVG only
**Pros:** lightest, most robust. **Cons:** loses the premium differentiator. Kept as the fallback mode.

## Trade-off Analysis
A gives the best "premium per hour of work" and keeps the whole app in one language. D remains as an automatic fallback.

## Consequences
- Easier: iterating visuals in code, binding visuals to sim state, lazy-loading.
- Harder: fidelity ceiling; need screenshot feedback loops.
- Revisit: if time remains, add scanned/hero assets or post-processing.

## Action Items
1. [ ] Terrain + habitat + camera rig first, then effects.
2. [ ] Enforce budgets in `docs/3D_PIPELINE.md`.
3. [ ] Implement WebGL detection and 2D fallback.
