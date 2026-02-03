// AssemblyAI Integration for Speech-to-Text
export interface AssemblyAITranscriptionResult {
  id: string;
  status: 'queued' | 'processing' | 'completed' | 'error';
  text?: string;
  confidence?: number;
  error?: string;
  audio_duration?: number;
}

export interface AssemblyAIUploadResponse {
  upload_url: string;
}

class AssemblyAIService {
  private apiKey: string;
  private baseUrl = '/assemblyai'; // via Vite proxy

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.NEXT_PUBLIC_ASSEMBLYAI_API_KEY || '';
    try {
      const len = this.apiKey ? this.apiKey.length : 0;
      if (len > 0) {
        console.debug(`[AssemblyAI] API key detected (length: ${len})`);
      } else {
        console.error('[AssemblyAI] No API key detected. Set NEXT_PUBLIC_ASSEMBLYAI_API_KEY in .env');
      }
    } catch { }
  }

  // Upload audio file to AssemblyAI
  async uploadAudio(audioBlob: Blob): Promise<string> {
    if (!this.apiKey) {
      console.warn('AssemblyAI API key not configured. Transcription will not be available.');
      throw new Error('AssemblyAI API key is required. Please set NEXT_PUBLIC_ASSEMBLYAI_API_KEY in your .env file.');
    }

    try {
      console.log('Uploading audio to AssemblyAI...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          Authorization: this.apiKey
        },
        body: audioBlob,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('AssemblyAI upload failed:', {
          status: response.status,
          statusText: response.statusText,
          errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data: AssemblyAIUploadResponse = await response.json();
      console.log('Audio uploaded successfully:', data.upload_url);
      return data.upload_url;
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Upload timeout - please try again with a shorter audio file');
      }
      console.error('Error uploading audio:', error);
      throw new Error(`Failed to upload audio: ${error}`);
    }
  }

  // Submit transcription request
  async submitTranscription(audioUrl: string, options: {
    language_code?: string;
    speaker_labels?: boolean;
    auto_highlights?: boolean;
    sentiment_analysis?: boolean;
  } = {}): Promise<string> {
    if (!this.apiKey) {
      throw new Error('AssemblyAI API key is required. Please set NEXT_PUBLIC_ASSEMBLYAI_API_KEY in your .env file.');
    }

    try {
      console.log('Submitting transcription request...');

      const requestBody = {
        audio_url: audioUrl,
        language_code: options.language_code || 'en',
        speaker_labels: options.speaker_labels || false,
        auto_highlights: options.auto_highlights || false,
        sentiment_analysis: options.sentiment_analysis || false,
        punctuate: true,
        format_text: true,
      };

      const response = await fetch(`${this.baseUrl}/transcript`, {
        method: 'POST',
        headers: {
          Authorization: this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Transcription request failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('Transcription submitted:', data.id);
      return data.id;
    } catch (error) {
      console.error('Error submitting transcription:', error);
      throw new Error(`Failed to submit transcription: ${error}`);
    }
  }

  // Get transcription result
  async getTranscription(transcriptionId: string): Promise<AssemblyAITranscriptionResult> {
    if (!this.apiKey) {
      throw new Error('AssemblyAI API key is required. Please set NEXT_PUBLIC_ASSEMBLYAI_API_KEY in your .env file.');
    }

    try {
      const response = await fetch(`${this.baseUrl}/transcript/${transcriptionId}`, {
        method: 'GET',
        headers: {
          Authorization: this.apiKey
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Get transcription failed: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      return {
        id: data.id,
        status: data.status,
        text: data.text,
        confidence: data.confidence,
        error: data.error,
        audio_duration: data.audio_duration,
      };
    } catch (error) {
      console.error('Error getting transcription:', error);
      throw new Error(`Failed to get transcription: ${error}`);
    }
  }

  // Poll for transcription completion
  async waitForTranscription(
    transcriptionId: string,
    onProgress?: (status: string) => void,
    maxWaitTime: number = 300000 // 5 minutes
  ): Promise<AssemblyAITranscriptionResult> {
    const startTime = Date.now();
    const pollInterval = 2000; // 2 seconds

    while (Date.now() - startTime < maxWaitTime) {
      const result = await this.getTranscription(transcriptionId);

      if (onProgress) {
        onProgress(result.status);
      }

      if (result.status === 'completed') {
        return result;
      }

      if (result.status === 'error') {
        throw new Error(`Transcription failed: ${result.error}`);
      }

      // Wait before polling again
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }

    throw new Error('Transcription timeout - took too long to complete');
  }

  // Complete transcription workflow
  async transcribeAudio(
    audioBlob: Blob,
    options: {
      language_code?: string;
      speaker_labels?: boolean;
      auto_highlights?: boolean;
      sentiment_analysis?: boolean;
    } = {},
    onProgress?: (stage: string, status?: string) => void
  ): Promise<AssemblyAITranscriptionResult> {
    if (!this.apiKey) {
      throw new Error('AssemblyAI API key is required. Please set NEXT_PUBLIC_ASSEMBLYAI_API_KEY in your .env file.');
    }

    try {
      console.log('AssemblyAI transcription workflow starting...');
      console.log('API Key present:', !!this.apiKey);
      console.log('Audio blob size:', audioBlob.size, 'bytes');
      console.log('Audio blob type:', audioBlob.type);

      // Step 1: Upload audio
      onProgress?.('Uploading audio...');
      const audioUrl = await this.uploadAudio(audioBlob);
      console.log('Audio uploaded successfully, URL:', audioUrl);

      // Step 2: Submit transcription
      onProgress?.('Starting transcription...');
      const transcriptionId = await this.submitTranscription(audioUrl, options);
      console.log('Transcription submitted successfully, ID:', transcriptionId);

      // Step 3: Wait for completion
      onProgress?.('Processing transcription...');
      const result = await this.waitForTranscription(
        transcriptionId,
        (status) => {
          console.log('AssemblyAI status update:', status);
          onProgress?.(`Transcription ${status}...`, status);
        },
      );

      console.log('AssemblyAI transcription completed successfully:', result);
      onProgress?.('Transcription completed!');
      return result;
    } catch (error) {
      console.error('Complete transcription workflow failed:', error);
      console.error('Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        apiKey: !!this.apiKey,
        baseUrl: this.baseUrl
      });
      // Return a proper error result instead of throwing
      return {
        id: '',
        status: 'error',
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }
}

// Create service instance (reads VITE_ASSEMBLYAI_API_KEY from .env by default)
export const assemblyAIService = new AssemblyAIService();
