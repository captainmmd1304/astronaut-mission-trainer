import type { Role, SolDecisions } from './decisions';

export interface CommsMessage {
  id: string;
  roomCode: string;
  fromRole: Role;
  fromName: string;
  body: string; // max 140 chars, filtered server-side
  sentAt: string; // ISO
  deliverAt: string; // ISO; sentAt + lightTime * COMMS_TIME_SCALE (or later if link down)
}

export interface RoomState {
  code: string;
  status: 'lobby' | 'running' | 'finished';
  members: { playerId: string; displayName: string; role: Role }[];
  sol: number;
  /** Seconds of (scaled) delay currently applied to comms. */
  commsDelaySeconds: number;
  linkUp: boolean;
}

export interface ClientToServerEvents {
  'room:join': (p: { code: string; role: Role }) => void;
  'comms:send': (p: { body: string }) => void;
  'sim:commit': (p: { decisions: SolDecisions }) => void;
}

export interface ServerToClientEvents {
  'room:state': (state: RoomState) => void;
  'comms:deliver': (message: CommsMessage) => void;
  /** Mission Control only: public telemetry from `ageSeconds` ago. Payload is a StepResult from @amt/sim (narrow in consumers). */
  'telemetry:delayed': (p: { sol: number; ageSeconds: number; payload: unknown }) => void;
  /** Outpost players: authoritative result of the sol. Payload is a StepResult from @amt/sim. */
  'sim:sol-resolved': (p: { sol: number; payload: unknown }) => void;
  'room:closed': (p: { reason: 'expired' | 'finished' | 'host-left' }) => void;
}
