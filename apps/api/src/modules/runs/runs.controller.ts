// PLACEHOLDER (no code yet)
// runs controller. Routes (auth required):
//   POST /v1/runs              body: CreateRunBody          -> register a run start
//   PUT  /v1/runs/:id/finish   body: FinishRunBody          -> store decisions + snapshots + outcome
//   GET  /v1/runs/:id                                       -> run log for replay
// Validate with zod schemas from @amt/shared; delegate to the service.
