// PLACEHOLDER (no code yet)
// Socket.IO gateway. Typed with ClientToServerEvents / ServerToClientEvents from @amt/shared.
// Handshake: verify the JWT from sessions.service. CORS from CORS_ORIGIN.
// Handlers: room:join (join the socket.io room, send room:state), comms:send (validate length <= 140, filter,
// rate-limit per socket, hand to delayed-comms), sim:commit (hand to rooms.service).
// Emits: room:state, comms:deliver, telemetry:delayed, sim:sol-resolved, room:closed.
// On disconnect: keep the member in the room for a grace period so reconnects restore state.
