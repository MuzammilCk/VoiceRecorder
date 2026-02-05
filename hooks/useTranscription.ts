import { useState, useCallback, useRef, useEffect } from 'react';
import { transcriptionService, TranscriptionResult } from '@/lib/transcription';
import { useToast } from '@/hooks/use-toast';
import { networkMonitor } from '@/lib/networkMonitor';

interface UseTranscriptionProps {
    language: string;
    useWhisper: boolean;
    useAssemblyAI: boolean;
}

export const useTranscription = ({
    language,
    useWhisper,
    useAssemblyAI
}: UseTranscriptionProps) => {
    const [transcript, setTranscript] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    const [transcriptionProgress, setTranscriptionProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    // Status tracking for visual feedback
    type TranscriptionStatus = 'idle' | 'listening' | 'error' | 'stopped' | 'max-retries';
    const [status, setStatus] = useState<TranscriptionStatus>('idle');
    const [browserInfo, setBrowserInfo] = useState<{
        supported: boolean;
        message: string;
        details?: string;
    } | null>(null);

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
        setError(err);

        // Determine status based on error message
        if (err.includes('max restart attempts') || err.includes('Max restart')) {
            setStatus('max-retries');
        } else {
            setStatus('error');
        }

        // Show user-visible feedback via toast
        toast({
            title: "Transcription Error",
            description: err,
            variant: "destructive"
        });
    }, [toast]);

    const startRealTime = useCallback(async () => {
        // If using cloud services (Whisper/AssemblyAI), we generally don't do browser real-time 
        // to avoid confusion or double processing. 
        // However, if the user wants real-time feedback + high quality later, we COULD do both.
        // The previous app logic disabled browser RT if cloud was enabled.
        // Let's stick to that pattern for now to match the existing user expectation of "switch".
        if (useWhisper || useAssemblyAI) {
            return;
        }

        // Get browser support info
        const supportInfo = transcriptionService.getBrowserSupportInfo();
        setBrowserInfo(supportInfo);

        if (!supportInfo.supported) {
            setError(supportInfo.message);
            setStatus('error');
            toast({
                title: "Browser Not Supported",
                description: supportInfo.message,
                variant: "destructive"
            });
            return;
        }

        isRealTimeActive.current = true;
        setError(null);
        setStatus('idle');

        try {
            const success = await transcriptionService.startRealTimeTranscription(
                language,
                handleRealTimeResult,
                handleRealTimeError
            );
            if (!success) {
                setError("Browser transcription not supported.");
                setStatus('error');
                toast({
                    title: "Transcription Unavailable",
                    description: "Browser transcription not supported. Recording will continue without transcription.",
                    variant: "destructive"
                });
            } else {
                setStatus('listening');
            }
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Unknown transcription error";
            setError(errorMsg);
            setStatus('error');
        }
    }, [language, useWhisper, useAssemblyAI, handleRealTimeResult, handleRealTimeError, toast]);

    const stopRealTime = useCallback(() => {
        isRealTimeActive.current = false;
        transcriptionService.stopRealTimeTranscription();
        setStatus('idle');
    }, []);

    const transcribeFile = useCallback(async (blob: Blob): Promise<TranscriptionResult> => {
        setIsTranscribing(true);
        setError(null);
        let result: TranscriptionResult;

        try {
            if (useWhisper) {
                result = await transcriptionService.transcribeWithWhisper(blob, language);
            } else if (useAssemblyAI) {
                // Use the new secure server-side proxy
                const formData = new FormData();
                formData.append('file', blob);

                // 1. Upload and start transcription
                const uploadRes = await fetch('/api/transcribe', {
                    method: 'POST',
                    body: formData
                });

                if (!uploadRes.ok) throw new Error('Failed to start transcription');
                const { id } = await uploadRes.json();

                // 2. Calculate dynamic timeout based on file size
                // Formula: 30s base + 1 minute per MB (conservative estimate)
                const fileSizeMB = blob.size / (1024 * 1024);
                const timeoutSeconds = Math.max(60, 30 + Math.ceil(fileSizeMB * 60));
                const maxAttempts = timeoutSeconds; // 1 attempt per second

                console.log(`Transcription timeout: ${timeoutSeconds}s for ${fileSizeMB.toFixed(2)}MB file`);

                // 3. Poll for results with progress indication
                let attempts = 0;
                setTranscriptionProgress(0);

                while (attempts < maxAttempts) {
                    const pollRes = await fetch(`/api/transcribe?id=${id}`);
                    const pollData = await pollRes.json();

                    // Update progress based on status
                    if (pollData.status === 'queued') {
                        setTranscriptionProgress(10);
                    } else if (pollData.status === 'processing') {
                        // Estimate progress: 10-90% during processing
                        const processingProgress = 10 + Math.min(80, (attempts / maxAttempts) * 80);
                        setTranscriptionProgress(Math.round(processingProgress));
                    }

                    if (pollData.status === 'completed') {
                        setTranscriptionProgress(100);
                        result = {
                            transcript: pollData.text,
                            method: 'assemblyai',
                            confidence: 0.99
                        };
                        break;
                    } else if (pollData.status === 'error') {
                        throw new Error(pollData.error || 'Transcription failed');
                    }

                    await new Promise(resolve => setTimeout(resolve, 1000));
                    attempts++;
                }

                if (!result!) {
                    throw new Error(`Transcription timed out after ${timeoutSeconds} seconds`);
                }
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
            setTranscriptionProgress(0);
        }
    }, [useWhisper, useAssemblyAI, language, toast]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
        transcriptRef.current = '';
        setError(null);
    }, []);

    // Network monitoring for real-time transcription
    useEffect(() => {
        const unsubscribe = networkMonitor.subscribe((online) => {
            // Only show notifications if real-time transcription is active
            if (!isRealTimeActive.current) return;

            if (!online) {
                // Network went offline
                setStatus('error');
                toast({
                    title: "Network Offline",
                    description: "Transcription paused. Will resume when connection is restored.",
                    variant: "destructive"
                });
            } else if (status === 'error') {
                // Network came back online and we were in error state
                toast({
                    title: "Network Restored",
                    description: "Transcription will resume automatically.",
                });
                // The transcription service will auto-restart via onend handler
            }
        });

        return () => {
            unsubscribe();
        };
    }, [status, toast]);

    return {
        transcript,
        setTranscript,
        resetTranscript,
        isTranscribing,
        transcriptionProgress,
        error,
        status,
        browserInfo,
        startRealTime,
        stopRealTime,
        transcribeFile
    };
};
