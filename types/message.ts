export interface Message {
  id: string;
  text: string;
  timestamp: number;
}

export type MessageCache = Message[];