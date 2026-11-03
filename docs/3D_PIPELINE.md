# 3D pipeline

## Can Claude build the 3D? Yes, with a clear split

**Claude can author directly, as code (React Three Fiber + three.js + GLSL):**
- Procedural Mars terrain from noise heightmaps, parameterized per landing site (colour, roughness, rock density).
- The outpost as low-poly models assembled from primitives (habitat domes, solar arrays, greenhouse, shielding berm, rover, antenna).
- Effects: solar flare glow and streaks, dust storm (fog + particles + dimmed light), dust accumulating on panels (shader uniform), butterscotch daytime sky with blue sunset.
- Camera rigs (limited-orbit isometric diorama), lighting, instanced rocks, post-processing, `<Html>` labels for systems.
- Performance work: instancing, LOD, dpr caps, geometry/material reuse.

**Claude cannot do reliably:**
- Sculpt or export binary meshes (GLB) or hand-paint textures.
- See the live render unless you send screenshots or screen recordings.

**Source these instead (licence-checked, logged in `apps/web/public/models/LICENSES.md`):** CC0 packs (e.g. Kenney), NASA public-domain 3D resources and Mars imagery for textures, CC0 audio. Keep each GLB under about 2 MB (Draco/meshopt compressed).

**Iteration loop:** Claude writes the component → you run `pnpm dev` → screenshot or short clip → Claude adjusts. Work in small scenes (terrain first, then habitat, then effects).

## Art direction

Stylized low-poly **diorama**: the outpost sits on a floating terrain slab with a visible cutaway of the habitat; systems glow when active (power, life support, shielding, greenhouse). Warm Mars palette, strong silhouettes, soft shadows. Premium comes from lighting, motion, polish and restraint, not triangle count.

## Scene graph (files in `apps/web/src/three`)

```
OutpostCanvas.tsx        <Canvas dpr=[1,1.5]> + camera rig + lights + <Suspense>
 ├─ Sky (inside OutpostCanvas)   gradient + sun; blue-sunset shader (later)
 ├─ MarsTerrain.tsx      params from landing site; instanced rocks
 ├─ Habitat.tsx          modules built from primitives; reads SimState for glow
 ├─ effects/SolarFlare.tsx      triggered by radiation event
 └─ effects/DustStorm.tsx       intensity from sim dust level
```

The scene reads from the Zustand store (`SimState`, active events). The sim never reads from the scene.

## Budgets and rules

- Target 60 fps on integrated GPUs; under about 150k triangles visible; at most about 100 draw calls.
- `dpr` capped at 1.5; shadows only from one directional light; no real-time reflections.
- No allocations in `useFrame`; no React state updates in `useFrame` (mutate refs/uniforms).
- Instance repeated objects (rocks, solar panels).
- Load the canvas with `next/dynamic` (`ssr: false`), only on `/play` and `/blackbox`.
- Respect `prefers-reduced-motion`: disable camera drift and heavy particle effects.
- Fallback: no WebGL or `?lite=1` → 2D SVG diorama with the same HUD.

## Landing site → terrain parameters

Each site in `@amt/content` maps to `{ seed, baseColor, rockDensity, roughness, skyTint, dustLevelBaseline }`. Bright terrain: lighter, dustier palette. Dark terrain: darker basalt palette with more contrast. Keep the mapping in one place in `MarsTerrain.tsx`.

## Stretch ideas

Earth shown as a pale-blue dot in the sky with a "signal in transit" pulse that travels for the real (scaled) light-time; Phobos transit across the sun.
