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
  private baseUrl = 'https://api.assemblyai.com/v2';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  // Upload audio file to AssemblyAI
  async uploadAudio(audioBlob: Blob): Promise<string> {
    try {
      console.log('Uploading audio to AssemblyAI...');
      
      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        headers: {
          'authorization': this.apiKey,
          'content-type': 'application/octet-stream',
        },
        body: audioBlob,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const data: AssemblyAIUploadResponse = await response.json();
      console.log('Audio uploaded successfully:', data.upload_url);
      return data.upload_url;
    } catch (error) {
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
          'authorization': this.apiKey,
          'content-type': 'application/json',
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
    try {
      const response = await fetch(`${this.baseUrl}/transcript/${transcriptionId}`, {
        method: 'GET',
        headers: {
          'authorization': this.apiKey,
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
    try {
      // Step 1: Upload audio
      onProgress?.('Uploading audio...');
      const audioUrl = await this.uploadAudio(audioBlob);

      // Step 2: Submit transcription
      onProgress?.('Starting transcription...');
      const transcriptionId = await this.submitTranscription(audioUrl, options);

      // Step 3: Wait for completion
      onProgress?.('Processing transcription...');
      const result = await this.waitForTranscription(
        transcriptionId,
        (status) => onProgress?.(`Transcription ${status}...`, status),
      );

      onProgress?.('Transcription completed!');
      return result;
    } catch (error) {
      console.error('Complete transcription workflow failed:', error);
      throw error;
    }
  }
}

// Create service instance with your API key
export const assemblyAIService = new AssemblyAIService('78be05aa994f4f2ea8ba728647f7fe2f');