import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Settings, Key, Globe, CheckCircle, XCircle, Info } from 'lucide-react';
import { transcriptionService } from '@/lib/transcription';

interface TranscriptionSettingsProps {
  language: string;
  setLanguage: (language: string) => void;
  useWhisper: boolean;
  setUseWhisper: (use: boolean) => void;
  isRecording: boolean;
}

export const TranscriptionSettings: React.FC<TranscriptionSettingsProps> = ({
  language,
  setLanguage,
  useWhisper,
  setUseWhisper,
  isRecording
}) => {
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  // State for browser support info - safe default for SSR
  const [browserSupport, setBrowserSupport] = useState<{ supported: boolean; message: string; details?: string }>({
    supported: false,
    message: 'Checking browser support...',
    details: undefined
  });

  const supportedLanguages = transcriptionService.getSupportedLanguages();

  // Move browser API call to useEffect to prevent SSR crashes
  useEffect(() => {
    setBrowserSupport(transcriptionService.getBrowserSupportInfo());
  }, []);

  const testWhisperConnection = async () => {
    setTestResult({ success: false, message: 'Testing connection...' });

    try {
      // Create a small test audio blob (1 second of silence)
      const audioContext = new AudioContext();
      const sampleRate = 44100;
      const duration = 1; // 1 second
      const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);

      // Convert to blob
      const audioData = new Float32Array(buffer.length);
      const blob = new Blob([audioData], { type: 'audio/wav' });

      const result = await transcriptionService.transcribeWithWhisper(
        blob,
        language.split('-')[0]
      );

      if (result.error) {
        setTestResult({ success: false, message: result.error });
      } else {
        setTestResult({ success: true, message: 'Whisper API connection successful!' });
      }
    } catch (error) {
      setTestResult({ success: false, message: `Connection failed: ${error}` });
    }
  };

  return (
    <Card className="glass border-border/50 p-6">
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Transcription Settings</h3>
        </div>

        {/* Browser Support Status */}
        <Alert className={browserSupport.supported ? "border-green-200 bg-green-50" : "border-yellow-200 bg-yellow-50"}>
          <Info className="h-4 w-4" />
          <AlertDescription>
            {browserSupport.message}
          </AlertDescription>
        </Alert>

        {/* Language Selection */}
        <div className="space-y-2">
          <Label htmlFor="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Recognition Language
          </Label>
          <Select value={language} onValueChange={setLanguage} disabled={isRecording}>
            <SelectTrigger>
              <SelectValue placeholder="Select language" />
            </SelectTrigger>
            <SelectContent>
              {supportedLanguages.map((lang) => (
                <SelectItem key={lang.code} value={lang.code}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Transcription Method */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-base font-medium">Transcription Method</Label>
              <p className="text-sm text-muted-foreground">
                Choose between browser-based or AI-powered transcription
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Browser Speech Recognition</span>
                  <Badge variant="secondary">Free</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Uses your browser's built-in speech recognition
                </p>
              </div>
              <Switch
                checked={!useWhisper}
                onCheckedChange={(checked) => setUseWhisper(!checked)}
                disabled={isRecording}
              />
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">OpenAI Whisper</span>
                  <Badge variant="default">Premium</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  High-accuracy AI transcription (server-side API key)
                </p>
              </div>
              <Switch
                checked={useWhisper}
                onCheckedChange={setUseWhisper}
                disabled={isRecording}
              />
            </div>
          </div>
        </div>

        {/* Whisper API Key */}
        {useWhisper && (
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              OpenAI API Key
            </Label>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={testWhisperConnection}
                disabled={isRecording}
              >
                Test Connection
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://platform.openai.com/api-keys', '_blank')}
                disabled={isRecording}
              >
                Get API Key
              </Button>
            </div>

            {testResult && (
              <Alert className={testResult.success ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>{testResult.message}</AlertDescription>
              </Alert>
            )}

            <p className="text-xs text-muted-foreground">
              Whisper uses the server-side API key configured for this app.
              Usage is charged by OpenAI based on audio duration.
            </p>
          </div>
        )}

        {/* Tips */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Tips for Better Transcription:</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Speak clearly and at a moderate pace</li>
            <li>• Minimize background noise</li>
            <li>• Use a good quality microphone</li>
            <li>• Choose the correct language for your content</li>
            {useWhisper && <li>• Whisper works better with longer recordings</li>}
          </ul>
        </div>
      </div>
    </Card>
  );
};
