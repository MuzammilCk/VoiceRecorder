// Emotion Analysis Service
// Uses server-side Hume AI proxy for secure analysis

export interface EmotionScore {
  emotion: string;
  confidence: number;
  description: string;
}

export interface EmotionAnalysisResult {
  emotions: EmotionScore[];
  dominantEmotion: string;
  confidence: number;
  audioFeatures?: AudioFeatures; // Kept for interface compatibility, though Hume might not return low-level features directly
  provider: 'hume' | 'error';
  error?: string;
}

export interface AudioFeatures {
  pitch: number;
  energy: number;
  spectralCentroid: number;
  zeroCrossingRate: number;
  tempo?: number;
}

class EmotionAnalysisService {
  /**
   * Identifies emotion from an audio blob using the secure server-side proxy.
   */
  async analyzeEmotion(audioBlob: Blob | string): Promise<EmotionAnalysisResult> {
    try {
      let blob: Blob;
      if (typeof audioBlob === 'string') {
        const response = await fetch(audioBlob);
        blob = await response.blob();
      } else {
        blob = audioBlob;
      }

      const formData = new FormData();
      formData.append('file', blob);

      const response = await fetch('/api/emotion', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      return result;

    } catch (error) {
      console.error('Emotion analysis failed:', error);
      return {
        emotions: [],
        dominantEmotion: 'unknown',
        confidence: 0,
        provider: 'error',
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  }

  // Method to set API key is deprecated/no-op as keys are now server-side
  setHumeApiKey(apiKey: string) {
    console.warn('setHumeApiKey is deprecated. Keys are managed on the server.');
  }
}

export const emotionAnalysisService = new EmotionAnalysisService();
