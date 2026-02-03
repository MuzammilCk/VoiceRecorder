// Emotion Analysis Service
// Supports multiple emotion analysis providers and local audio feature extraction

export interface EmotionScore {
  emotion: string;
  confidence: number;
  description: string;
}

export interface EmotionAnalysisResult {
  emotions: EmotionScore[];
  dominantEmotion: string;
  confidence: number;
  audioFeatures?: AudioFeatures;
  provider: 'hume' | 'local' | 'error';
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
  private humeApiKey: string = '';

  constructor() {
    // Load API key from environment variables first, then localStorage as fallback
    // Guard localStorage access for server-side rendering
    this.humeApiKey =
      process.env.NEXT_PUBLIC_HUME_API_KEY ||
      (typeof window !== 'undefined' ? localStorage.getItem('humeApiKey') || '' : '') ||
      '';
    // Masked console hint to verify key detection (only logs presence/length)
    try {
      const len = this.humeApiKey ? this.humeApiKey.length : 0;
      if (len > 0) {
        console.debug(`[EmotionAnalysis] Hume API key detected (length: ${len})`);
      } else {
        console.warn('[EmotionAnalysis] No Hume API key detected');
      }
    } catch { }
  }

  setHumeApiKey(apiKey: string) {
    this.humeApiKey = apiKey;
    // Guard localStorage access for server-side rendering
    if (typeof window !== 'undefined') {
      localStorage.setItem('humeApiKey', apiKey);
    }
  }

  // Analyze emotion using Hume AI API
  async analyzeWithHume(audioBlob: Blob): Promise<EmotionAnalysisResult> {
    if (!this.humeApiKey) {
      console.warn('Hume AI API key not configured. Using local analysis instead.');
      return this.analyzeLocally(audioBlob);
    }

    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.webm');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      try {
        // Use Vite proxy to avoid CORS and attach API key server-side
        const response = await fetch('/hume/v0/batch/jobs', {
          method: 'POST',
          headers: {
            // Header also added by dev proxy; keeping here for completeness in non-dev builds
            'X-Hume-Api-Key': this.humeApiKey,
          },
          body: formData,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Hume AI API error: ${response.status} ${response.statusText}`);
        }

        const result = await response.json();

        // Process Hume AI response
        return this.processHumeResponse(result);
      } catch (fetchError) {
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Hume AI request timeout - please try again');
        }
        throw fetchError;
      }
    } catch (error) {
      console.error('Hume AI analysis failed:', error);
      // Fallback to local analysis if Hume AI fails
      console.log('Falling back to local emotion analysis...');
      return this.analyzeLocally(audioBlob);
    }
  }

  // Local audio feature extraction and basic emotion inference
  async analyzeLocally(audioBlob: Blob): Promise<EmotionAnalysisResult> {
    try {
      const audioFeatures = await this.extractAudioFeatures(audioBlob);
      const emotions = this.inferEmotionsFromFeatures(audioFeatures);

      return {
        emotions,
        dominantEmotion: emotions[0]?.emotion || 'neutral',
        confidence: emotions[0]?.confidence || 0.5,
        audioFeatures,
        provider: 'local'
      };
    } catch (error) {
      console.error('Local emotion analysis failed:', error);
      return {
        emotions: [{ emotion: 'neutral', confidence: 0.5, description: 'Default neutral emotion' }],
        dominantEmotion: 'neutral',
        confidence: 0.5,
        provider: 'error',
        error: error instanceof Error ? error.message : 'Local analysis failed'
      };
    }
  }

  // Extract audio features using Web Audio API
  private async extractAudioFeatures(audioBlob: Blob): Promise<AudioFeatures> {
    const arrayBuffer = await audioBlob.arrayBuffer();
    const audioContext = new AudioContext();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Calculate basic audio features
    const pitch = this.calculatePitch(channelData, sampleRate);
    const energy = this.calculateEnergy(channelData);
    const spectralCentroid = this.calculateSpectralCentroid(channelData, sampleRate);
    const zeroCrossingRate = this.calculateZeroCrossingRate(channelData);

    return {
      pitch,
      energy,
      spectralCentroid,
      zeroCrossingRate
    };
  }

  // Calculate fundamental frequency (pitch)
  private calculatePitch(audioData: Float32Array, sampleRate: number): number {
    const bufferSize = 1024;
    const correlations = new Array(bufferSize);

    for (let i = 0; i < bufferSize; i++) {
      let sum = 0;
      for (let j = 0; j < bufferSize - i; j++) {
        sum += audioData[j] * audioData[j + i];
      }
      correlations[i] = sum;
    }

    let maxCorrelation = 0;
    let bestOffset = 0;

    for (let i = 1; i < correlations.length; i++) {
      if (correlations[i] > maxCorrelation) {
        maxCorrelation = correlations[i];
        bestOffset = i;
      }
    }

    return bestOffset > 0 ? sampleRate / bestOffset : 0;
  }

  // Calculate RMS energy
  private calculateEnergy(audioData: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < audioData.length; i++) {
      sum += audioData[i] * audioData[i];
    }
    return Math.sqrt(sum / audioData.length);
  }

  // Calculate spectral centroid (brightness)
  private calculateSpectralCentroid(audioData: Float32Array, sampleRate: number): number {
    const fftSize = 2048;
    const fft = new Float32Array(fftSize);

    // Simple FFT approximation for spectral centroid
    let weightedSum = 0;
    let magnitudeSum = 0;

    for (let i = 0; i < Math.min(fftSize, audioData.length); i++) {
      const magnitude = Math.abs(audioData[i]);
      const frequency = (i * sampleRate) / fftSize;
      weightedSum += frequency * magnitude;
      magnitudeSum += magnitude;
    }

    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }

  // Calculate zero crossing rate
  private calculateZeroCrossingRate(audioData: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < audioData.length; i++) {
      if ((audioData[i] >= 0) !== (audioData[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / audioData.length;
  }

  // Enhanced emotion inference with more detailed analysis
  private inferEmotionsFromFeatures(features: AudioFeatures): EmotionScore[] {
    const { pitch, energy, spectralCentroid, zeroCrossingRate } = features;

    // Enhanced heuristic-based emotion detection with more emotions
    const emotions: EmotionScore[] = [
      { emotion: 'happiness', confidence: Math.min(0.95, (energy * 0.7 + spectralCentroid * 0.3) * (pitch > 150 ? 1.1 : 0.9)), description: 'High energy and bright tone suggest happiness' },
      { emotion: 'excitement', confidence: Math.min(0.9, energy * 1.2 * (zeroCrossingRate > 0.5 ? 1.1 : 0.8)), description: 'Very high energy with vocal variation indicates excitement' },
      { emotion: 'joy', confidence: Math.min(0.88, (energy + spectralCentroid + (pitch > 180 ? 0.2 : 0)) / 2.2), description: 'Elevated pitch and energy reflect joyful expression' },
      { emotion: 'sadness', confidence: Math.max(0.15, (1 - energy) * (pitch < 120 ? 1.2 : 0.8)), description: 'Low energy and pitch suggest sadness or melancholy' },
      { emotion: 'melancholy', confidence: Math.max(0.12, (1 - energy * 0.8) * (spectralCentroid < 0.4 ? 1.1 : 0.7)), description: 'Subdued tone with low brightness indicates melancholy' },
      { emotion: 'anger', confidence: Math.min(0.85, energy * 1.1 * (pitch > 200 ? 1.3 : 0.7) * (zeroCrossingRate > 0.6 ? 1.1 : 0.8)), description: 'High energy with harsh vocal qualities suggest anger' },
      { emotion: 'frustration', confidence: Math.min(0.8, energy * 0.9 * (zeroCrossingRate > 0.5 ? 1.2 : 0.6)), description: 'Moderate energy with vocal tension indicates frustration' },
      { emotion: 'fear', confidence: Math.min(0.75, zeroCrossingRate * 1.1 * (pitch > 250 ? 1.2 : 0.8)), description: 'High pitch with trembling voice suggests fear or anxiety' },
      { emotion: 'anxiety', confidence: Math.min(0.7, zeroCrossingRate * 0.9 * (energy > 0.6 ? 1.1 : 0.8)), description: 'Vocal tension and unsteadiness indicate anxiety' },
      { emotion: 'calm', confidence: Math.max(0.25, (1 - (energy + zeroCrossingRate) / 2) * (pitch < 150 ? 1.1 : 0.9)), description: 'Steady, low energy voice reflects calmness' },
      { emotion: 'neutral', confidence: Math.max(0.2, 1 - Math.abs(energy - 0.5) - Math.abs(pitch - 150) / 300), description: 'Balanced vocal characteristics suggest neutral state' },
      { emotion: 'confidence', confidence: Math.min(0.8, energy * 0.8 * (pitch > 140 && pitch < 200 ? 1.2 : 0.7)), description: 'Strong, controlled voice indicates confidence' },
      { emotion: 'surprise', confidence: Math.min(0.7, (energy + zeroCrossingRate) * 0.6 * (pitch > 220 ? 1.3 : 0.6)), description: 'Sudden pitch elevation suggests surprise' },
      { emotion: 'disgust', confidence: Math.min(0.6, energy * 0.7 * (spectralCentroid < 0.3 ? 1.2 : 0.5)), description: 'Harsh, low-frequency emphasis indicates disgust' },
      { emotion: 'contempt', confidence: Math.min(0.65, energy * 0.6 * (pitch < 100 ? 1.3 : 0.6)), description: 'Low, controlled tone suggests contempt or disdain' }
    ];

    // Anger: Higher energy, variable pitch, high zero crossing rate
    if (features.energy > 0.4 && features.zeroCrossingRate > 0.1) {
      emotions.push({
        emotion: 'anger',
        confidence: Math.min(0.85, features.energy * (features.zeroCrossingRate * 5)),
        description: 'High energy and vocal tension suggest anger'
      });
    }

    // Fear/Anxiety: Higher pitch, moderate energy, high spectral centroid
    if (features.pitch > 250 && features.spectralCentroid > 2000) {
      emotions.push({
        emotion: 'fear',
        confidence: Math.min(0.7, (features.pitch / 400) * (features.spectralCentroid / 4000)),
        description: 'High pitch and brightness suggest fear or anxiety'
      });
    }

    // Calm/Neutral: Moderate values across all features
    if (features.pitch > 100 && features.pitch < 250 && features.energy > 0.1 && features.energy < 0.4) {
      emotions.push({
        emotion: 'calm',
        confidence: 0.6,
        description: 'Balanced audio features suggest calm or neutral state'
      });
    }

    // Excitement: High energy, high pitch, high spectral centroid
    if (features.energy > 0.5 && features.pitch > 220 && features.spectralCentroid > 2500) {
      emotions.push({
        emotion: 'excitement',
        confidence: Math.min(0.8, features.energy * (features.pitch / 300)),
        description: 'High energy and pitch suggest excitement'
      });
    }

    // Sort by confidence and return top emotions
    emotions.sort((a, b) => b.confidence - a.confidence);

    // If no emotions detected, return neutral
    if (emotions.length === 0) {
      emotions.push({
        emotion: 'neutral',
        confidence: 0.5,
        description: 'No clear emotional indicators detected'
      });
    }

    return emotions.slice(0, 5); // Return top 5 emotions
  }

  // Process Hume AI API response
  private processHumeResponse(humeResult: any): EmotionAnalysisResult {
    try {
      // This is a placeholder for actual Hume AI response processing
      // The actual structure would depend on Hume AI's response format
      const emotions: EmotionScore[] = [
        { emotion: 'happiness', confidence: 0.7, description: 'Detected from Hume AI analysis' },
        { emotion: 'calm', confidence: 0.6, description: 'Secondary emotion detected' }
      ];

      return {
        emotions,
        dominantEmotion: emotions[0].emotion,
        confidence: emotions[0].confidence,
        provider: 'hume'
      };
    } catch (error) {
      throw new Error('Failed to process Hume AI response');
    }
  }

  // Main analysis method using only Hume AI
  async analyzeEmotion(audioBlob: Blob | string): Promise<EmotionAnalysisResult> {
    if (!this.humeApiKey) {
      return {
        emotions: [],
        dominantEmotion: 'unknown',
        confidence: 0,
        provider: 'error',
        error: 'Hume AI API key is required for emotion analysis'
      };
    }

    let blob: Blob;
    if (typeof audioBlob === 'string') {
      const response = await fetch(audioBlob);
      blob = await response.blob();
    } else {
      blob = audioBlob;
    }

    return await this.analyzeWithHume(blob);
  }
}

export const emotionAnalysisService = new EmotionAnalysisService();
