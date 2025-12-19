import { useState, useCallback, useRef } from 'react';
import { transcriptionService, TranscriptionResult } from '@/lib/transcription';
import { useToast } from '@/hooks/use-toast';

interface UseTranscriptionProps {
    language: string;
    useWhisper: boolean;
    whisperApiKey: string;
    useAssemblyAI: boolean;
}

export const useTranscription = ({
    language,
    useWhisper,
    whisperApiKey,
    useAssemblyAI
}: UseTranscriptionProps) => {
    const [transcript, setTranscript] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Ref to keep track of real-time transcription status and content
    const isRealTimeActive = useRef(false);
    const transcriptRef = useRef('');

    const handleRealTimeResult = useCallback((newTranscript: string, isFinal: boolean) => {
        transcriptRef.current = newTranscript;
        setTranscript(newTranscript);
        if (isFinal) {
            // Optionally log or handle final chunks specially
        }
    }, []);

    const handleRealTimeError = useCallback((err: string) => {
        console.warn("Transcription error:", err);
        // We don't always set global error state on transient errors to avoid UI flickering/breakage,
        // but if it's persistent, the service might keep retrying or fail.
        // For user visibility, we can show a toast or set error if it's critical.
        // Given the "seamless" requirement, let's log it but maybe not interrupt flow unless necessary.
    }, []);

    const startRealTime = useCallback(async () => {
        // If using cloud services (Whisper/AssemblyAI), we generally don't do browser real-time 
        // to avoid confusion or double processing. 
        // However, if the user wants real-time feedback + high quality later, we COULD do both.
        // The previous app logic disabled browser RT if cloud was enabled.
        // Let's stick to that pattern for now to match the existing user expectation of "switch".
        if (useWhisper || useAssemblyAI) {
            return;
        }

        isRealTimeActive.current = true;
        setError(null);
        try {
            const success = await transcriptionService.startRealTimeTranscription(
                language,
                handleRealTimeResult,
                handleRealTimeError
            );
            if (!success) {
                setError("Browser transcription not supported.");
                toast({
                    title: "Transcription Unavailable",
                    description: "Browser transcription not supported. Recording will continue without transcription.",
                    variant: "destructive"
                });
            }
        } catch (e) {
            setError(e instanceof Error ? e.message : "Unknown transcription error");
        }
    }, [language, useWhisper, useAssemblyAI, handleRealTimeResult, handleRealTimeError, toast]);

    const stopRealTime = useCallback(() => {
        isRealTimeActive.current = false;
        transcriptionService.stopRealTimeTranscription();
    }, []);

    const transcribeFile = useCallback(async (blob: Blob): Promise<TranscriptionResult> => {
        setIsTranscribing(true);
        setError(null);
        let result: TranscriptionResult;

        try {
            if (useWhisper && whisperApiKey) {
                result = await transcriptionService.transcribeWithWhisper(blob, whisperApiKey, language);
            } else if (useAssemblyAI) {
                result = await transcriptionService.transcribeWithAssemblyAI(blob, language);
            } else {
                // Browser fallback: Use the accumulated transcript from real-time
                result = {
                    transcript: transcriptRef.current,
                    method: 'browser',
                    confidence: 0.8
                };
            }

            if (result.error) {
                setError(result.error);
                toast({ variant: "destructive", title: "Transcription Error", description: result.error });
            } else if (result.transcript) {
                setTranscript(result.transcript);
                transcriptRef.current = result.transcript;
            }

            return result;

        } catch (e) {
            const errMsg = e instanceof Error ? e.message : "Failed to transcribe";
            setError(errMsg);
            return { transcript: '', method: 'manual', error: errMsg };
        } finally {
            setIsTranscribing(false);
        }
    }, [useWhisper, whisperApiKey, useAssemblyAI, language, toast]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        transcriptRef.current = '';
        setError(null);
    }, []);

    return {
        transcript,
        setTranscript,
        resetTranscript,
        isTranscribing,
        error,
        startRealTime,
        stopRealTime,
        transcribeFile
    };
};
