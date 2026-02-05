import { TranscriptionResult } from './transcription';

/**
 * Transcribe using OpenAI Whisper API via secure backend proxy.
 * This ensures the API key is never exposed to the client.
 */
export async function transcribeWithWhisper(
    audioBlob: Blob,
    language: string = 'en'
): Promise<TranscriptionResult> {
    try {
        const formData = new FormData();
        formData.append('file', audioBlob, 'recording.webm');
        formData.append('language', language);

        console.log('[Whisper] Submitting file for transcription...');

        const response = await fetch('/api/whisper', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || errorData.message || `HTTP ${response.status}`;
            console.error('[Whisper] API Error:', errorMessage);
            throw new Error(errorMessage);
        }

        const result = await response.json();

        // Validate response structure
        if (!result.text && !result.segments) {
            console.warn('[Whisper] Received empty transcript');
        }

        return {
            transcript: result.text || '',
            method: 'whisper',
            confidence: 0.95 // Whisper typically has high accuracy
        };

    } catch (error) {
        console.error('[Whisper] Transcription failed:', error);
        return {
            transcript: '',
            method: 'whisper',
            error: `Whisper API error: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
