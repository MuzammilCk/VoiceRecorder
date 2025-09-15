// ACRCloud Humming Recognition Service
// This service uses ACRCloud's API for real song recognition from humming/singing

export interface AudioFeatures {
  tempo: number;
  key: string;
  mode: string;
  timeSignature: number;
  energy: number;
  danceability: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  liveness: number;
  speechiness: number;
}

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
  audio_features?: AudioFeatures;
}

export interface RecognitionResult {
  success: boolean;
  match?: SongMatch;
  confidence?: number;
  error?: string;
  processing_time: number;
  method: 'acrcloud';
}

class RealSongRecognitionService {
  // ACRCloud API configuration
  private readonly ACRCLOUD_HOST = 'identify-us-west-2.acrcloud.com';
  private readonly ACRCLOUD_ENDPOINT = '/v1/identify';
  
  // Note: In production, these should be environment variables
  private readonly ACCESS_KEY = import.meta.env.VITE_ACRCLOUD_ACCESS_KEY || '';
  private readonly ACCESS_SECRET = import.meta.env.VITE_ACRCLOUD_ACCESS_SECRET || '';

  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;

  constructor() {
    if (!this.ACCESS_KEY || !this.ACCESS_SECRET) {
      console.warn('ACRCloud API credentials not found. Please set VITE_ACRCLOUD_ACCESS_KEY and VITE_ACRCLOUD_ACCESS_SECRET environment variables.');
    }
  }

  // Generate HMAC signature for ACRCloud API
  private async generateSignature(data: string, timestamp: number): Promise<string> {
    const message = `POST\n${this.ACRCLOUD_ENDPOINT}\n${this.ACCESS_KEY}\naudio\n1\n${timestamp}`;
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(this.ACCESS_SECRET),
      { name: 'HMAC', hash: 'SHA-1' },
      false,
      ['sign']
    );
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
    return btoa(String.fromCharCode(...new Uint8Array(signature)));
  }

  // Convert audio blob to base64 for ACRCloud API
  private async audioToBase64(audioBlob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        const base64 = result.split(',')[1]; // Remove data:audio/wav;base64, prefix
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });
  }

  // Call ACRCloud API for song recognition
  private async callACRCloudAPI(audioBlob: Blob): Promise<any> {
    if (!this.ACCESS_KEY || !this.ACCESS_SECRET) {
      console.warn('ACRCloud API credentials not configured. Using demo mode.');
      // Return a demo response for development
      return {
        status: { code: 1001 },
        metadata: null
      };
    }

    const timestamp = Math.floor(Date.now() / 1000);
    
    try {
      const signature = await this.generateSignature('', timestamp);
      const audioBase64 = await this.audioToBase64(audioBlob);

      const formData = new FormData();
      formData.append('sample', audioBase64);
      formData.append('sample_bytes', audioBlob.size.toString());
      formData.append('access_key', this.ACCESS_KEY);
      formData.append('data_type', 'audio');
      formData.append('signature_version', '1');
      formData.append('signature', signature);
      formData.append('timestamp', timestamp.toString());

      // Use Vite proxy (configured at /acr) to avoid CORS in development
      const response = await fetch(`/acr${this.ACRCLOUD_ENDPOINT}`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`ACRCloud API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ACRCloud API call failed:', error);
      // Return error response
      return {
        status: { code: 1001, msg: 'API call failed' },
        metadata: null
      };
    }
  }

  // Parse ACRCloud response to our format
  private parseACRCloudResponse(acrResponse: any): SongMatch | null {
    if (acrResponse.status?.code !== 0 || !acrResponse.metadata?.music?.[0]) {
      return null;
    }

    const music = acrResponse.metadata.music[0];
    
    return {
      title: music.title || 'Unknown Title',
      artists: music.artists?.map((artist: any) => ({ name: artist.name })) || [{ name: 'Unknown Artist' }],
      album: { name: music.album?.name || 'Unknown Album' },
      release_date: music.release_date || '',
      confidence: (acrResponse.metadata.music[0].score || 0) / 100,
      preview_url: music.external_metadata?.youtube?.vid ? 
        `https://www.youtube.com/watch?v=${music.external_metadata.youtube.vid}` : undefined,
      external_urls: {
        spotify: music.external_metadata?.spotify?.track?.id ? 
          `https://open.spotify.com/track/${music.external_metadata.spotify.track.id}` : undefined,
        youtube: music.external_metadata?.youtube?.vid ? 
          `https://www.youtube.com/watch?v=${music.external_metadata.youtube.vid}` : undefined,
      }
    };
  }


  // Main recognition method using ACRCloud API
  async recognizeSong(audioBlob: Blob, method: 'acrcloud' = 'acrcloud'): Promise<RecognitionResult> {
    const startTime = Date.now();
    
    try {
      // Call ACRCloud API for real song recognition
      const acrResponse = await this.callACRCloudAPI(audioBlob);
      
      // Parse the response
      const match = this.parseACRCloudResponse(acrResponse);
      
      const processingTime = Date.now() - startTime;
      
      if (match) {
        return {
          success: true,
          match,
          confidence: match.confidence,
          processing_time: processingTime,
          method
        };
      } else {
        return {
          success: false,
          error: "No matching song found. Try humming or singing more clearly, or the song might not be in the database.",
          processing_time: processingTime,
          method
        };
      }
      
    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      // Provide helpful error messages based on the error type
      let errorMessage = 'Recognition failed: ';
      if (error instanceof Error) {
        if (error.message.includes('credentials')) {
          errorMessage += 'API credentials not configured. Please contact the administrator.';
        } else if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage += 'Network error. Please check your internet connection and try again.';
        } else {
          errorMessage += error.message;
        }
      } else {
        errorMessage += 'Unknown error occurred.';
      }
      
      return {
        success: false,
        error: errorMessage,
        processing_time: processingTime,
        method
      };
    }
  }

  // Cleanup resources
  cleanup() {
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export const realSongRecognitionService = new RealSongRecognitionService();
