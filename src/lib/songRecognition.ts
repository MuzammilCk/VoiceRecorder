import { SongResult, RecognitionMethod, RecognitionOptions } from './types';

export interface AudioAnalysis {
  duration: number;
  sampleRate: number;
  channels: number;
  format: string;
  size: number;
}

export interface RecognitionProgress {
  stage: 'recording' | 'processing' | 'analyzing' | 'searching' | 'complete';
  progress: number;
  message: string;
}

class SongRecognitionService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private microphone: MediaStreamAudioSourceNode | null = null;
  private stream: MediaStream | null = null;

  constructor() {
    this.initializeAudioContext();
  }

  private async initializeAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.error('Failed to initialize audio context:', error);
    }
  }

  /**
   * Analyze audio characteristics for better recognition
   */
  async analyzeAudio(audioBlob: Blob): Promise<AudioAnalysis> {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(audioBlob);
      
      audio.onloadedmetadata = () => {
        const analysis: AudioAnalysis = {
          duration: audio.duration,
          sampleRate: 44100, // Default assumption
          channels: 1, // Mono for humming
          format: audioBlob.type,
          size: audioBlob.size
        };
        
        URL.revokeObjectURL(url);
        resolve(analysis);
      };
      
      audio.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to analyze audio'));
      };
      
      audio.src = url;
    });
  }

  /**
   * Enhance audio quality for better recognition
   */
  async enhanceAudio(audioBlob: Blob): Promise<Blob> {
    try {
      if (!this.audioContext) {
        await this.initializeAudioContext();
      }

      if (!this.audioContext) {
        throw new Error('Audio context not available');
      }

      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Apply audio enhancement (noise reduction, normalization, etc.)
      const enhancedBuffer = this.applyAudioEnhancement(audioBuffer);
      
      // Convert back to blob
      return this.audioBufferToBlob(enhancedBuffer);
    } catch (error) {
      console.warn('Audio enhancement failed, using original:', error);
      return audioBlob;
    }
  }

  private applyAudioEnhancement(audioBuffer: AudioBuffer): AudioBuffer {
    const { numberOfChannels, length, sampleRate } = audioBuffer;
    const enhancedBuffer = this.audioContext!.createBuffer(numberOfChannels, length, sampleRate);
    
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const inputData = audioBuffer.getChannelData(channel);
      const outputData = enhancedBuffer.getChannelData(channel);
      
      // Apply normalization and basic noise reduction
      let max = 0;
      for (let i = 0; i < length; i++) {
        max = Math.max(max, Math.abs(inputData[i]));
      }
      
      const normalizeFactor = max > 0 ? 0.95 / max : 1;
      
      for (let i = 0; i < length; i++) {
        let sample = inputData[i] * normalizeFactor;
        
        // Simple noise gate
        if (Math.abs(sample) < 0.01) {
          sample *= 0.1;
        }
        
        outputData[i] = sample;
      }
    }
    
    return enhancedBuffer;
  }

  private audioBufferToBlob(audioBuffer: AudioBuffer): Promise<Blob> {
    return new Promise((resolve) => {
      const numberOfChannels = audioBuffer.numberOfChannels;
      const length = audioBuffer.length;
      const sampleRate = audioBuffer.sampleRate;
      
      // Create WAV file
      const buffer = new ArrayBuffer(44 + length * numberOfChannels * 2);
      const view = new DataView(buffer);
      
      // WAV header
      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };
      
      writeString(0, 'RIFF');
      view.setUint32(4, 36 + length * numberOfChannels * 2, true);
      writeString(8, 'WAVE');
      writeString(12, 'fmt ');
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numberOfChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, sampleRate * numberOfChannels * 2, true);
      view.setUint16(32, numberOfChannels * 2, true);
      view.setUint16(34, 16, true);
      writeString(36, 'data');
      view.setUint32(40, length * numberOfChannels * 2, true);
      
      // Audio data
      let offset = 44;
      for (let i = 0; i < length; i++) {
        for (let channel = 0; channel < numberOfChannels; channel++) {
          const sample = Math.max(-1, Math.min(1, audioBuffer.getChannelData(channel)[i]));
          view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7FFF, true);
          offset += 2;
        }
      }
      
      resolve(new Blob([buffer], { type: 'audio/wav' }));
    });
  }

  /**
   * Recognize song using ACRCloud API
   */
  async recognizeWithACRCloud(
    audioBlob: Blob,
    onProgress?: (progress: RecognitionProgress) => void
  ): Promise<SongResult | null> {
    try {
      onProgress?.({ stage: 'processing', progress: 20, message: 'Enhancing audio quality...' });
      
      const enhancedAudio = await this.enhanceAudio(audioBlob);
      const analysis = await this.analyzeAudio(enhancedAudio);
      
      onProgress?.({ stage: 'analyzing', progress: 40, message: 'Analyzing audio characteristics...' });
      
      // ACRCloud configuration
      const ACRCLOUD_HOST = 'identify-ap-southeast-1.acrcloud.com';
      const ACRCLOUD_ACCESS_KEY = '3ba89bcb8469e4328c9f26898b04ad87';
      
      const formData = new FormData();
      formData.append('sample', enhancedAudio, 'recording.wav');
      formData.append('access_key', ACRCLOUD_ACCESS_KEY);
      formData.append('data_type', 'audio');
      formData.append('signature_version', '1');
      formData.append('timestamp', String(Math.floor(Date.now() / 1000)));
      
      onProgress?.({ stage: 'searching', progress: 60, message: 'Searching ACRCloud database...' });
      
      const response = await fetch(`https://${ACRCLOUD_HOST}/v1/identify`, {
        method: 'POST',
        body: formData,
      });
      
      const result = await response.json();
      
      onProgress?.({ stage: 'complete', progress: 100, message: 'Recognition complete' });
      
      if (result.status.code === 0 && result.metadata?.music?.length > 0) {
        const song = result.metadata.music[0];
        return {
          title: song.title,
          artists: song.artists.map((artist: any) => ({ name: artist.name })),
          album: { name: song.album.name },
          release_date: song.release_date,
          method: 'acrcloud',
          confidence: song.score || 0.8,
          preview_url: song.external_metadata?.spotify?.preview_url,
          external_urls: {
            spotify: song.external_metadata?.spotify?.external_urls?.spotify,
            youtube: song.external_metadata?.youtube?.vid
          }
        };
      }
      
      return null;
    } catch (error) {
      console.error('ACRCloud recognition failed:', error);
      throw new Error(`ACRCloud recognition failed: ${error}`);
    }
  }

  /**
   * Recognize song using Shazam API (if available)
   */
  async recognizeWithShazam(
    audioBlob: Blob,
    onProgress?: (progress: RecognitionProgress) => void
  ): Promise<SongResult | null> {
    try {
      onProgress?.({ stage: 'processing', progress: 20, message: 'Processing audio for Shazam...' });
      
      // Note: This is a placeholder implementation
      // In a real implementation, you would use Shazam's API
      // For now, we'll simulate the process
      
      onProgress?.({ stage: 'searching', progress: 60, message: 'Searching Shazam database...' });
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      onProgress?.({ stage: 'complete', progress: 100, message: 'Shazam recognition complete' });
      
      // Return null for now (placeholder)
      return null;
    } catch (error) {
      console.error('Shazam recognition failed:', error);
      throw new Error(`Shazam recognition failed: ${error}`);
    }
  }

  /**
   * Recognize song using multiple methods and return the best result
   */
  async recognizeSong(
    audioBlob: Blob,
    options: RecognitionOptions = {},
    onProgress?: (progress: RecognitionProgress) => void
  ): Promise<SongResult | null> {
    const methods = options.methods || ['acrcloud'];
    const results: (SongResult | null)[] = [];
    
    try {
      for (let i = 0; i < methods.length; i++) {
        const method = methods[i];
        const progress = Math.floor((i / methods.length) * 100);
        
        onProgress?.({ 
          stage: 'searching', 
          progress, 
          message: `Trying ${method} recognition...` 
        });
        
        let result: SongResult | null = null;
        
        switch (method) {
          case 'acrcloud':
            result = await this.recognizeWithACRCloud(audioBlob, onProgress);
            break;
          case 'shazam':
            result = await this.recognizeWithShazam(audioBlob, onProgress);
            break;
          default:
            console.warn(`Unknown recognition method: ${method}`);
        }
        
        if (result) {
          results.push(result);
          // If we found a high-confidence result, return it immediately
          if (result.confidence && result.confidence > 0.9) {
            return result;
          }
        }
      }
      
      // Return the result with highest confidence
      if (results.length > 0) {
        return results.reduce((best, current) => 
          (current?.confidence || 0) > (best?.confidence || 0) ? current : best
        );
      }
      
      return null;
    } catch (error) {
      console.error('Song recognition failed:', error);
      throw error;
    }
  }

  /**
   * Get audio level for visualization
   */
  getAudioLevel(): number {
    if (!this.analyser) return 0;
    
    const dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(dataArray);
    
    const average = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    return average / 255;
  }

  /**
   * Start audio monitoring for visualization
   */
  async startAudioMonitoring(stream: MediaStream): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }
    
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }
    
    this.stream = stream;
    this.microphone = this.audioContext.createMediaStreamSource(stream);
    this.analyser = this.audioContext.createAnalyser();
    
    this.analyser.fftSize = 256;
    this.microphone.connect(this.analyser);
  }

  /**
   * Stop audio monitoring
   */
  stopAudioMonitoring(): void {
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    
    if (this.analyser) {
      this.analyser = null;
    }
    
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
  }

  /**
   * Cleanup resources
   */
  cleanup(): void {
    this.stopAudioMonitoring();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

// Export singleton instance
export const songRecognitionService = new SongRecognitionService();
