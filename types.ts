export interface Entity {
  label: string;
  value: string;
  description?: string;
}

export interface Intent {
  label: string;
  score: number; // 0 to 1
}

export interface NlpAnalysis {
  detectedIntents: Intent[];
  extractedEntities: Entity[];
  response: string;
  processingTimeMs: number;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  analysis?: NlpAnalysis; // Only assistant messages might have attached analysis of the PREVIOUS user message
}

export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ERROR = 'error'
}