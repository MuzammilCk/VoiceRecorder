import { TranscriptionResult } from './transcription';

const POLLING_INTERVAL = 1000; // 1 second
const MAX_POLLING_TIME = 300000; // 5 minutes

interface AssemblyUIResponse {
    id: string;
    status: 'queued' | 'processing' | 'completed' | 'error';
    text?: string;
    error?: string;
    words?: any[];
    utterances?: any[];
    confidence?: number;
}

/**
 * Transcribes audio using AssemblyAI via our secure backend proxy.
 * Handles the upload -> submit -> poll flow.
 */
export async function transcribeWithAssemblyAI(audioBlob: Blob): Promise<TranscriptionResult> {
    const startTime = Date.now();

    try {
        // 1. Upload & Submit (handled by single API call now)
        const formData = new FormData();
        formData.append('file', audioBlob);

        console.log('[AssemblyAI] Submitting file for transcription...');
        const submitResponse = await fetch('/api/transcribe', {
            method: 'POST',
            body: formData,
        });

        if (!submitResponse.ok) {
            const errorData = await submitResponse.json().catch(() => ({}));
            throw new Error(errorData.error || `Submission failed with status ${submitResponse.status}`);
        }

        const initialData: AssemblyUIResponse = await submitResponse.json();
        const transcriptId = initialData.id;

        if (!transcriptId) {
            throw new Error('No transcript ID received from API');
        }

        console.log(`[AssemblyAI] Job submitted. ID: ${transcriptId}. Polling for results...`);

        // 2. Poll for results
        while (Date.now() - startTime < MAX_POLLING_TIME) {
            const pollResponse = await fetch(`/api/transcribe?id=${transcriptId}`);

            if (!pollResponse.ok) {
                // If polling fails temporarily, log it but don't crash immediately unless it's a 4xx
                console.warn('[AssemblyAI] Polling check failed, retrying...', pollResponse.status);
                if (pollResponse.status >= 400 && pollResponse.status < 500) {
                    const errorData = await pollResponse.json().catch(() => ({}));
                    throw new Error(errorData.error || `Polling failed with status ${pollResponse.status}`);
                }
            } else {
                const pollData: AssemblyUIResponse = await pollResponse.json();

                if (pollData.status === 'completed') {
                    console.log('[AssemblyAI] Transcription completed!');
                    return {
                        transcript: pollData.text || '',
                        method: 'assemblyai',
                        confidence: pollData.confidence,
                        utterances: pollData.utterances, // Pass through diarization if available
                        words: pollData.words // Pass through word timings if available
                    };
                } else if (pollData.status === 'error') {
                    throw new Error(pollData.error || 'AssemblyAI reported an error during processing');
                } else {
                    // Still processing/queued
                    // console.debug(`[AssemblyAI] Status: ${pollData.status}`);
                }
            }

            // Wait before next poll
            await new Promise(resolve => setTimeout(resolve, POLLING_INTERVAL));
        }

        throw new Error('Transcription timed out after 5 minutes');

    } catch (error) {
        console.error('[AssemblyAI] Error:', error);
        return {
            transcript: '',
            method: 'assemblyai',
            error: error instanceof Error ? error.message : String(error)
        };
    }
}
