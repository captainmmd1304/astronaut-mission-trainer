// PLACEHOLDER (no code yet)
// "/play": the game screen (solo mode).
// Flow: choose scenario + landing site (SitePicker) -> fetch conditions snapshot -> run loop per sol:
// briefing -> power sliders + project/EVA/shelter choices (HUD) -> sim.step() locally -> sol report -> repeat.
// Loads the 3D canvas with next/dynamic (ssr: false). Falls back to a 2D diorama if WebGL is unavailable or ?lite=1.
// At the end: upload the run log (PUT /v1/runs/:id/finish) and route to /debrief/[runId].
