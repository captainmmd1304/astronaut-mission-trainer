// PLACEHOLDER (no code yet)
// Delayed comms scheduler (per room), built on DelayedQueue + computeDeliverAtMs from @amt/shared.
//   - on comms:send: deliverAtMs = computeDeliverAtMs(now, snapshot.lightTimeSeconds, COMMS_TIME_SCALE, linkRestoredAtMs)
//   - persist the Message (sentAt, deliverAt) before scheduling
//   - one timer per room set to queue.nextDueAtMs(); on fire, drain(now) and emit comms:deliver to the target role
//   - when the link goes down (solar conjunction / blackout effect): queue.holdUntil(restoredAtMs)
//   - telemetry for MISSION_CONTROL goes through a second queue with the same delay (what Earth sees is stale)
//   - on boot: reload undelivered messages from Postgres and re-enqueue
