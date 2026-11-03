// PLACEHOLDER (no code yet)
// Socket.IO client (URL from NEXT_PUBLIC_WS_URL), typed with ServerToClientEvents / ClientToServerEvents from @amt/shared.
// Responsibilities: connect with the guest JWT, auto-reconnect and re-join the room, forward room:state,
// comms:deliver, telemetry:delayed and sim:sol-resolved into game/store.ts, expose sendComms() and commitDecisions().
// If the connection cannot be restored, surface a state that lets the UI offer solo mode.
