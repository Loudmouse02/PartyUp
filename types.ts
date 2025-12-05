export type PlayerClass = "wizard" | "fighter" | "rogue";

export type VoteValue = "yes" | "maybe" | "no";

export interface Player {
  id: string;
  name: string;
  class: PlayerClass;
}

export interface Vote {
  playerId: string;
  sessionId: string;
  value: VoteValue;
}

export interface Session {
  id: string;
  campaignId: string;
  dateTime: Date; // Stored in UTC
  timezone: string; // DM's timezone (IANA timezone identifier)
}

export interface Campaign {
  id: string;
  name: string;
  dmName: string;
  dmTimezone: string; // IANA timezone identifier (e.g., "America/New_York")
  sessions: Session[];
  players: Player[];
  votes: Vote[];
  createdAt: Date;
}

