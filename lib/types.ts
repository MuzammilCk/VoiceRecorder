export interface SongResult {
  title: string;
  artists: { name: string }[];
  album: { name: string };
  release_date: string;
  method: RecognitionMethod;
  confidence?: number;
  preview_url?: string;
  external_urls?: {
    spotify?: string;
    youtube?: string;
    apple_music?: string;
  };
  genres?: string[];
  duration?: number;
  popularity?: number;
}

export type RecognitionMethod = 'acrcloud' | 'shazam' | 'audd' | 'auddio';

export interface RecognitionOptions {
  methods?: RecognitionMethod[];
  timeout?: number;
  confidence_threshold?: number;
  enhance_audio?: boolean;
}

export interface RecognitionProgress {
  stage: 'recording' | 'processing' | 'analyzing' | 'searching' | 'complete';
  progress: number;
  message: string;
}

export interface AudioAnalysis {
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
  size: number;
  frequency_spectrum?: number[];
  tempo?: number;
  key?: string;
  energy?: number;
}

export interface SearchHistory {
  id: string;
  timestamp: Date;
  method: RecognitionMethod;
  result: SongResult | null;
  audio_duration: number;
  confidence?: number;
}

export interface RecognitionStats {
  total_searches: number;
  successful_searches: number;
  average_confidence: number;
  most_used_method: RecognitionMethod;
  search_history: SearchHistory[];
}
