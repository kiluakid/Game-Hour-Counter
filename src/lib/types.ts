export interface Game {
  id: string;
  title: string;
  coverUrl: string;
  totalPlaytimeMs: number;
  lastPlayed?: number;
}

export interface PlaySession {
  gameId: string;
  startTime: number;
}
