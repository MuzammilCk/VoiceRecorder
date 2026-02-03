import { Recording } from '@/types';


import { Utterance, Word } from '@/types';

export interface TranscriptionResult {
  transcript: string;
  method: 'browser' | 'whisper' | 'assemblyai' | 'manual';
  confidence?: number;
  error?: string;
  utterances?: Utterance[]; // For diarization
  words?: Word[]; // For karaoke
}

export interface TranscriptionOptions {
  language?: string;
  useWhisper?: boolean;
  whisperApiKey?: string;
  useAssemblyAI?: boolean;
}

class TranscriptionService {
  private isSupported: boolean;
  private recognition: any = null;

  constructor() {
    this.isSupported = this.checkBrowserSupport();
  }

  private checkBrowserSupport(): boolean {
    if (typeof window === 'undefined') return false;
    const hasSupport = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
    console.log('Browser speech recognition support:', hasSupport);
    if (!hasSupport) {
      console.warn('Speech recognition not supported. Available in:', {
        SpeechRecognition: !!window.SpeechRecognition,
        webkitSpeechRecognition: !!window.webkitSpeechRecognition,
        userAgent: navigator.userAgent
      });
    }
    return hasSupport;
  }

  private shouldRestart: boolean = false;

  /**
   * Real-time transcription using Web Speech API
   */
  async startRealTimeTranscription(
    language: string = 'en-US',
    onResult: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ): Promise<boolean> {
    if (!this.isSupported) {
      const errorMsg = 'Speech recognition not supported in this browser. Please use Chrome, Edge, or Safari.';
      console.error(errorMsg);
      onError(errorMsg);
      return false;
    }

    try {
      // Stop any existing recognition
      if (this.recognition) {
        this.shouldRestart = false; // Prevent auto-restart from the previous instance
        this.recognition.stop();
        this.recognition = null;
      }

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.recognition = new SpeechRecognition();

      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = language;
      this.recognition.maxAlternatives = 1;
      this.shouldRestart = true; // Enable auto-restart

      let finalTranscript = '';

      this.recognition.onstart = () => {
        console.log('Speech recognition started');
      };

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;

          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
            onResult(finalTranscript.trim(), true);
          } else {
            interimTranscript += transcript;
            onResult(finalTranscript + interimTranscript, false);
          }
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);

        // Don't restart on fatal errors
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          this.shouldRestart = false;
        }

        let errorMessage = `Speech recognition error: ${event.error}`;

        // Provide more specific error messages
        switch (event.error) {
          case 'no-speech':
            // This often happens on silence, we'll auto-restart in onend
            return;
          case 'audio-capture':
            errorMessage = 'Microphone access denied. Please allow microphone access and try again.';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access in your browser settings.';
            break;
          case 'network':
            errorMessage = 'Network error. Please check your internet connection.';
            break;
          case 'service-not-allowed':
            errorMessage = 'Speech recognition service not allowed. Please check your browser settings.';
            break;
        }

        onError(errorMessage);
      };

      this.recognition.onend = () => {
        console.log('Speech recognition ended');
        if (this.shouldRestart) {
          console.log('Auto-restarting speech recognition...');
          try {
            this.recognition.start();
          } catch (e) {
            console.error('Failed to restart speech recognition', e);
            this.shouldRestart = false; // Give up if immediate restart fails
          }
        }
      };

      this.recognition.start();
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      onError(`Failed to start speech recognition: ${error}`);
      return false;
    }
  }

  /**
   * Stop real-time transcription
   */
  stopRealTimeTranscription(): void {
    this.shouldRestart = false;
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
    }
  }

  /**
   * Transcribe audio blob using Web Speech API (post-processing)
   */
  async transcribeAudioBlob(
    audioBlob: Blob,
    language: string = 'en-US'
  ): Promise<TranscriptionResult> {
    if (!this.isSupported) {
      return {
        transcript: '',
        method: 'browser',
        error: 'Speech recognition not supported in this browser'
      };
    }

    try {
      // Convert blob to audio element and play it for recognition
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);

      return new Promise((resolve) => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.continuous = true;
        recognition.interimResults = false;
        recognition.lang = language;
        recognition.maxAlternatives = 1;

        let transcript = '';

        recognition.onresult = (event: any) => {
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript + ' ';
          }
        };

        recognition.onend = () => {
          URL.revokeObjectURL(audioUrl);
          resolve({
            transcript: transcript.trim(),
            method: 'browser',
            confidence: 0.8 // Default confidence for browser API
          });
        };

        recognition.onerror = (event: any) => {
          URL.revokeObjectURL(audioUrl);
          resolve({
            transcript: '',
            method: 'browser',
            error: `Speech recognition error: ${event.error}`
          });
        };

        // Start recognition and play audio
        recognition.start();
        audio.play().catch(() => {
          // If audio play fails, still try recognition
          console.warn('Audio playback failed, but continuing with recognition');
        });
      });
    } catch (error) {
      return {
        transcript: '',
        method: 'browser',
        error: `Transcription failed: ${error}`
      };
    }
  }

  /**
   * Transcribe using AssemblyAI API (high accuracy)
   */


  /**
   * Transcribe using OpenAI Whisper API (requires API key)
   */
  async transcribeWithWhisper(
    audioBlob: Blob,
    apiKey: string,
    language: string = 'en'
  ): Promise<TranscriptionResult> {
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'recording.webm');
      formData.append('model', 'whisper-1');
      formData.append('language', language);
      formData.append('response_format', 'json');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}`);
      }

      const result = await response.json();

      return {
        transcript: result.text || '',
        method: 'whisper',
        confidence: 0.95 // Whisper typically has high accuracy
      };
    } catch (error) {
      return {
        transcript: '',
        method: 'whisper',
        error: `Whisper API error: ${error}`
      };
    }
  }

  /**
   * Get available languages for speech recognition
   */
  getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en-US', name: 'English (US)' },
      { code: 'en', name: 'English' },
      { code: 'en-GB', name: 'English (UK)' },
      { code: 'es-ES', name: 'Spanish (Spain)' },
      { code: 'es', name: 'Spanish' },
      { code: 'es-MX', name: 'Spanish (Mexico)' },
      { code: 'fr-FR', name: 'French' },
      { code: 'fr', name: 'French' },
      { code: 'de-DE', name: 'German' },
      { code: 'de', name: 'German' },
      { code: 'it-IT', name: 'Italian' },
      { code: 'it', name: 'Italian' },
      { code: 'pt-BR', name: 'Portuguese (Brazil)' },
      { code: 'pt-PT', name: 'Portuguese (Portugal)' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru-RU', name: 'Russian' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja-JP', name: 'Japanese' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko-KR', name: 'Korean' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh-CN', name: 'Chinese (Simplified)' },
      { code: 'zh-TW', name: 'Chinese (Traditional)' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar-SA', name: 'Arabic' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi-IN', name: 'Hindi' },
      { code: 'hi', name: 'Hindi' },
      { code: 'nl-NL', name: 'Dutch' },
      { code: 'nl', name: 'Dutch' },
      { code: 'sv-SE', name: 'Swedish' },
      { code: 'no-NO', name: 'Norwegian' },
      { code: 'da-DK', name: 'Danish' },
      { code: 'fi-FI', name: 'Finnish' },
      { code: 'pl-PL', name: 'Polish' },
      { code: 'tr-TR', name: 'Turkish' },
      { code: 'he-IL', name: 'Hebrew' },
      { code: 'th-TH', name: 'Thai' },
      { code: 'vi-VN', name: 'Vietnamese' },
    ];
  }

  /**
   * Check if the service is ready to use
   */
  isReady(): boolean {
    return this.isSupported;
  }

  /**
   * Get browser support information
   */
  getBrowserSupportInfo(): { supported: boolean; message: string; details?: string } {
    if (this.isSupported) {
      return {
        supported: true,
        message: 'Speech recognition is supported in your browser',
        details: `Using ${window.SpeechRecognition ? 'SpeechRecognition' : 'webkitSpeechRecognition'}`
      };
    } else {
      const userAgent = navigator.userAgent;
      let browserName = 'Unknown';
      if (userAgent.includes('Chrome')) browserName = 'Chrome';
      else if (userAgent.includes('Firefox')) browserName = 'Firefox';
      else if (userAgent.includes('Safari')) browserName = 'Safari';
      else if (userAgent.includes('Edge')) browserName = 'Edge';

      return {
        supported: false,
        message: `Speech recognition is not supported in ${browserName}. Please use Chrome, Edge, or Safari for best results.`,
        details: `Current browser: ${browserName} (${userAgent})`
      };
    }
  }
}

// Export singleton instance
export const transcriptionService = new TranscriptionService();

// Export utility functions
export const formatTranscriptionTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export const validateTranscription = (transcript: string): { valid: boolean; message: string } => {
  if (!transcript || transcript.trim().length === 0) {
    return { valid: false, message: 'No transcript available' };
  }

  if (transcript.trim().length < 3) {
    return { valid: false, message: 'Transcript too short' };
  }

  return { valid: true, message: 'Transcript is valid' };
};
