// PLACEHOLDER (no code yet)
// debrief service.
//   1. Replay the run through @amt/sim to get the full event list.
//   2. Find the failure event (or final state) and walk `causedBy` backwards to build the cause chain.
//   3. Mark learning objectives met/missed using each objective's provenBy (eventType + explainKey).
//   4. Produce text: try OpenRouter (integrations/openrouter.client.ts) with the structured chain as input;
//      if no key, timeout or error, use the template text keyed by explainKey (always available).
//   5. Persist as DebriefReport with generatedBy = llm | template.
// The LLM only phrases facts it is given; it must not invent events.
// (Optional repository file can be added if persistence logic grows.)
