import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recording } from '@/types';
import { transcriptionService } from '@/lib/transcription';

interface TranscribeRecordingProps {
  recording: Recording;
  onTranscriptionComplete: (recordingId: string, transcript: string, utterances?: any[], words?: any[]) => void;
  language: string;
}

export const TranscribeRecording: React.FC<TranscribeRecordingProps> = ({
  recording,
  onTranscriptionComplete,
  language
}) => {
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionResult, setTranscriptionResult] = useState<{
    success: boolean;
    transcript: string;
    error?: string;
  } | null>(null);
  const { toast } = useToast();

  const transcribeWithBrowser = async () => {
    setIsTranscribing(true);
    setTranscriptionResult(null);

    try {
      let blob = recording.blob;
      if (typeof blob === 'string') {
        const r = await fetch(blob);
        blob = await r.blob();
      }
      const result = await transcriptionService.transcribeAudioBlob(blob, language);

      if (result.error) {
        setTranscriptionResult({
          success: false,
          transcript: '',
          error: result.error
        });
        toast({
          title: "Transcription Failed",
          description: result.error,
          variant: "destructive"
        });
      } else {
        setTranscriptionResult({
          success: true,
          transcript: result.transcript
        });
        onTranscriptionComplete(recording.id, result.transcript);

        // Trigger auto-indexing for RAG
        fetch('/api/rag/index', {
          method: 'POST',
          body: JSON.stringify({ recordingId: recording.id, text: result.transcript })
        }).catch(err => console.error('Auto-indexing failed:', err));

        toast({
          title: "Transcription Complete",
          description: "Recording transcribed successfully"
        });
      }
    } catch (error) {
      const errorMessage = `Transcription failed: ${error}`;
      setTranscriptionResult({
        success: false,
        transcript: '',
        error: errorMessage
      });
      toast({
        title: "Transcription Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const transcribeWithWhisper = async () => {
    setIsTranscribing(true);
    setTranscriptionResult(null);

    try {
      let blob = recording.blob;
      if (typeof blob === 'string') {
        const r = await fetch(blob);
        blob = await r.blob();
      }

      const result = await transcriptionService.transcribeWithWhisper(
        blob,
        language.split('-')[0]
      );

      if (result.error) {
        setTranscriptionResult({
          success: false,
          transcript: '',
          error: result.error
        });
        toast({
          title: "Whisper Transcription Failed",
          description: result.error,
          variant: "destructive"
        });
      } else {
        setTranscriptionResult({
          success: true,
          transcript: result.transcript
        });
        onTranscriptionComplete(recording.id, result.transcript);
        toast({
          title: "Whisper Transcription Complete",
          description: "High-quality transcription completed"
        });
      }
    } catch (error) {
      const errorMessage = `Whisper transcription failed: ${error}`;
      setTranscriptionResult({
        success: false,
        transcript: '',
        error: errorMessage
      });
      toast({
        title: "Whisper Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const transcribeWithAssemblyAI = async () => {
    setIsTranscribing(true);
    setTranscriptionResult(null);

    try {
      const formData = new FormData();
      formData.append('file', recording.blob instanceof Blob ? recording.blob : new Blob([recording.blob]));

      // 1. Start Transcription
      const uploadRes = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        throw new Error(await uploadRes.text());
      }

      const { id } = await uploadRes.json();

      // 2. Poll for results
      const pollInterval = setInterval(async () => {
        try {
          const pollRes = await fetch(`/api/transcribe?id=${id}`);
          const pollData = await pollRes.json();

          if (pollData.status === 'completed') {
            clearInterval(pollInterval);
            setIsTranscribing(false);

            setTranscriptionResult({
              success: true,
              transcript: pollData.text
            });

            // Pass full result including utterances if available
            onTranscriptionComplete(recording.id, pollData.text, pollData.utterances, pollData.words);

            // Trigger auto-indexing for RAG
            fetch('/api/rag/index', {
              method: 'POST',
              body: JSON.stringify({ recordingId: recording.id, text: pollData.text })
            }).catch(err => console.error('Auto-indexing failed:', err));

            toast({
              title: "AssemblyAI Transcription Complete",
              description: "Diarization complete!"
            });
          } else if (pollData.status === 'error') {
            clearInterval(pollInterval);
            throw new Error(pollData.error);
          }
          // else: continue polling
        } catch (err) {
          clearInterval(pollInterval);
          setIsTranscribing(false);
          const errorMessage = `Polling failed: ${err}`;
          setTranscriptionResult({
            success: false,
            transcript: '',
            error: errorMessage
          });
          toast({
            title: "Transcription Error",
            description: errorMessage,
            variant: "destructive"
          });
        }
      }, 3000);

    } catch (error) {
      setIsTranscribing(false);
      const errorMessage = `AssemblyAI transcription failed: ${error}`;
      setTranscriptionResult({
        success: false,
        transcript: '',
        error: errorMessage
      });
      toast({
        title: "AssemblyAI Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const hasTranscript = recording.transcript && recording.transcript.trim().length > 0;

  return (
    <Card className="p-4 border border-border/50">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span className="font-medium">{recording.name}</span>
          </div>
          {hasTranscript && (
            <div className="flex items-center gap-1 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Transcribed</span>
            </div>
          )}
        </div>

        {hasTranscript && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800 font-medium mb-1">Current Transcript:</p>
            <p className="text-sm text-green-700">{recording.transcript}</p>
          </div>
        )}

        {transcriptionResult && (
          <Alert className={transcriptionResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
            {transcriptionResult.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertDescription>
              {transcriptionResult.success ? (
                <div>
                  <p className="font-medium text-green-800 mb-2">Transcription Complete:</p>
                  <p className="text-green-700">{transcriptionResult.transcript}</p>
                </div>
              ) : (
                <p className="text-red-600">{transcriptionResult.error}</p>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={transcribeWithBrowser}
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Transcribe (Browser)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={transcribeWithAssemblyAI}
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Transcribe (AssemblyAI)
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={transcribeWithWhisper}
            disabled={isTranscribing}
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Transcribe (Whisper)
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="text-xs text-muted-foreground">
            • Browser: Free, real-time, basic accuracy<br />
            • AssemblyAI: High accuracy, built-in, recommended<br />
            • Whisper: High accuracy, uses server-side API key
          </p>
        </div>
      </div>
    </Card>
  );
};
