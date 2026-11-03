// PLACEHOLDER (no code yet)
// rooms controller. Routes (auth required):
//   POST /v1/rooms              body: CreateRoomBody  -> create room, return 6-char code
//   POST /v1/rooms/:code/join   body: JoinRoomBody    -> join with a role (OUTPOST or MISSION_CONTROL)
//   GET  /v1/rooms/:code                              -> current RoomState
