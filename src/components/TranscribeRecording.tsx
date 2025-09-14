import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recording } from '@/App';
import { transcriptionService } from '@/lib/transcription';

interface TranscribeRecordingProps {
  recording: Recording;
  onTranscriptionComplete: (recordingId: string, transcript: string) => void;
  whisperApiKey: string;
  language: string;
}

export const TranscribeRecording: React.FC<TranscribeRecordingProps> = ({
  recording,
  onTranscriptionComplete,
  whisperApiKey,
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
      const result = await transcriptionService.transcribeAudioBlob(recording.blob, language);
      
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
    if (!whisperApiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please provide a Whisper API key in settings",
        variant: "destructive"
      });
      return;
    }

    setIsTranscribing(true);
    setTranscriptionResult(null);

    try {
      const result = await transcriptionService.transcribeWithWhisper(
        recording.blob,
        whisperApiKey,
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
      const result = await transcriptionService.transcribeWithAssemblyAI(
        recording.blob,
        language.split('-')[0], // Convert 'en-US' to 'en'
        (stage, status) => {
          console.log(`AssemblyAI Progress: ${stage}`, status);
        }
      );
      
      if (result.error) {
        setTranscriptionResult({
          success: false,
          transcript: '',
          error: result.error
        });
        toast({
          title: "AssemblyAI Transcription Failed",
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
          title: "AssemblyAI Transcription Complete",
          description: "High-quality transcription completed"
        });
      }
    } catch (error) {
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
    } finally {
      setIsTranscribing(false);
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
            disabled={isTranscribing || !whisperApiKey.trim()}
          >
            {isTranscribing ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            Transcribe (Whisper)
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p className="text-xs text-muted-foreground">
            • Browser: Free, real-time, basic accuracy<br/>
            • AssemblyAI: High accuracy, built-in, recommended<br/>
            • Whisper: High accuracy, requires API key
          </p>
        </div>
      </div>
    </Card>
  );
};
