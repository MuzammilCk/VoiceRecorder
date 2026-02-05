import { toast } from "@/hooks/use-toast";

export interface SongMatch {
  title: string;
  artists: { name: string }[];
  album: { name: string };
  release_date: string;
  confidence: number;
  preview_url?: string;
  external_urls?: {
    spotify?: string;
    youtube?: string;
    apple_music?: string;
  };
}

export interface RecognitionResult {
  success: boolean;
  match?: SongMatch;
  confidence?: number;
  error?: string;
  processing_time?: number;
  method?: 'acrcloud';
}

export class RealSongRecognitionService {
  /**
   * Identifies a song from an audio blob using the secure server-side proxy.
   */
  async recognizeSong(audioBlob: Blob, method: 'acrcloud' = 'acrcloud'): Promise<RecognitionResult> {
    const startTime = Date.now();
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/song-recognize', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      const processingTime = Date.now() - startTime;

      if (data.success && data.match) {
        return {
          success: true,
          match: data.match,
          confidence: data.match.confidence,
          processing_time: processingTime,
          method
        };
      } else {
        return {
          success: false,
          error: data.error || 'No match found',
          processing_time: processingTime,
          method
        };
      }

    } catch (error) {
      console.error('Song identification failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Identification failed',
        processing_time: Date.now() - startTime,
        method
      };
    }
  }
}

export const realSongRecognitionService = new RealSongRecognitionService();
