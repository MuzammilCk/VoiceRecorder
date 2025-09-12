import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Square, Play, Pause, Download, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LanguageSelector } from './LanguageSelector';
import { Recording } from '@/App'; // Import the shared Recording type
import { Input } from '@/components/ui/input'; // Import the Input component

// Add this interface to your component file to make TypeScript happy with the Web Speech API
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    SpeechRecognition: any;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    webkitSpeechRecognition: any;
  }
}

// Props interface to receive state from App.tsx
interface VoiceRecorderProps {
  recordings: Recording[];
  setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ recordings, setRecordings }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(40).fill(0));
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [recordingName, setRecordingName] = useState('');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number>();
  const recordingIntervalRef = useRef<NodeJS.Timeout>();
  const recordingTimeRef = useRef(0);
  const transcriptRef = useRef('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);

  const { toast } = useToast();

  useEffect(() => {
    // Cleanup logic
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const startRecording = async () => {
    setTranscript('');
    transcriptRef.current = '';
    setCurrentRecording(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, sampleRate: 44100 }
      });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      updateAudioLevels();

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunks.push(event.data);
      };

      recognitionRef.current?.stop();

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const finalTranscriptToSave = transcriptRef.current.trim();
        const timestamp = new Date();
        
        let name = recordingName.trim();
        if (!name) {
            // Create a default timestamp-based name if input is empty
            const year = timestamp.getFullYear();
            const month = String(timestamp.getMonth() + 1).padStart(2, '0');
            const day = String(timestamp.getDate()).padStart(2, '0');
            const hours = String(timestamp.getHours()).padStart(2, '0');
            const minutes = String(timestamp.getMinutes()).padStart(2, '0');
            const seconds = String(timestamp.getSeconds()).padStart(2, '0');
            name = `Recording ${year}-${month}-${day} ${hours}.${minutes}.${seconds}`;
        }

        const newRecording: Recording = {
          id: Date.now().toString(),
          name: name,
          blob,
          duration: recordingTimeRef.current,
          timestamp: timestamp,
          transcript: finalTranscriptToSave,
        };
        setRecordings(prev => [newRecording, ...prev]);
        setCurrentRecording(newRecording);
        setTranscript(finalTranscriptToSave);
        toast({ title: "Recording Saved", description: `Saved as "${newRecording.name}"` });

        setRecordingName(''); // Reset input field for the next recording
      };

      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast({ title: "Browser Not Supported", variant: "destructive" });
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;
      recognitionRef.current = recognition;

      let finalTranscript = '';
      
      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        const fullTranscript = finalTranscript + interimTranscript;
        transcriptRef.current = fullTranscript;
        setTranscript(fullTranscript);
      };
      
      recognition.start();
      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => {
            const newTime = prev + 1;
            recordingTimeRef.current = newTime;
            return newTime;
        });
      }, 1000);

    } catch (error) {
      toast({ title: "Recording Error", description: "Could not access microphone.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      recognitionRef.current?.stop();
      setIsRecording(false);
      streamRef.current?.getTracks().forEach(track => track.stop());
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      setAudioLevels(new Array(40).fill(0));
    }
  };

  const updateAudioLevels = () => {
    if (!analyserRef.current || !isRecording) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    const levels = Array.from(dataArray).map(v => v / 255);
    setAudioLevels(levels.slice(0, 40));
    animationFrameRef.current = requestAnimationFrame(updateAudioLevels);
  };

  const playRecording = (recording: Recording) => {
    if (audioRef.current) audioRef.current.pause();
    const audio = new Audio(URL.createObjectURL(recording.blob));
    audioRef.current = audio;
    audio.onplay = () => { setIsPlaying(true); setCurrentRecording(recording); };
    audio.onpause = () => setIsPlaying(false);
    audio.onended = () => { setIsPlaying(false); setCurrentRecording(null); };
    audio.play();
    setTranscript(recording.transcript || 'No transcript available.');
  };

  const pausePlayback = () => {
    if (audioRef.current) audioRef.current.pause();
  };

  const downloadRecording = (recording: Recording) => {
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    if (currentRecording?.id === id) {
      setCurrentRecording(null);
      setTranscript('');
    }
    toast({ title: "Recording Deleted" });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card className="glass border-border/50 p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Voice recorder
            </h1>
            <p className="text-muted-foreground">Professional Voice Intelligence</p>
          </div>
          <div className="flex items-center justify-center gap-1 h-20 bg-waveform-bg rounded-lg p-4">
            {audioLevels.map((level, index) => (
              <div key={index} className={cn("bg-waveform rounded-full transition-all duration-75", isRecording && "waveform-bar")} style={{ width: '4px', height: `${Math.max(4, level * 100)}px`, animationDelay: `${index * 50}ms` }}/>
            ))}
          </div>
          <div className="text-2xl font-mono text-primary">
            {formatTime(recordingTime)}
          </div>
          <div className="w-full max-w-sm mx-auto space-y-4">
            <Input
              type="text"
              placeholder="Name your recording..."
              value={recordingName}
              onChange={(e) => setRecordingName(e.target.value)}
              disabled={isRecording}
              className="bg-background/50 text-center"
            />
          </div>
          <div className="flex justify-center items-center gap-4">
            <LanguageSelector language={language} setLanguage={setLanguage} isRecording={isRecording} />
            <Button
              size="lg"
              variant={isRecording ? "destructive" : "default"}
              className={cn("h-20 w-20 rounded-full transition-all duration-300", isRecording && "recording-pulse glow-recording")}
              onClick={isRecording ? stopRecording : startRecording}
            >
              {isRecording ? <Square className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
            </Button>
          </div>
        </div>
      </Card>

      {(transcript || currentRecording?.transcript) && (
        <Card className="glass border-border/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Transcript</h2>
          <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">{transcript || currentRecording?.transcript}</p>
        </Card>
      )}

      {recordings.length > 0 && (
        <Card className="glass border-border/50 p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Recordings</h2>
          <div className="space-y-3">
            {recordings.map((recording) => (
              <div key={recording.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border/30">
                <div className="flex items-center gap-4">
                  <Button size="sm" variant="ghost" onClick={() => (isPlaying && currentRecording?.id === recording.id) ? pausePlayback() : playRecording(recording)}>
                    {(isPlaying && currentRecording?.id === recording.id) ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div>
                    <p className="font-medium">{recording.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatTime(recording.duration)} • {recording.timestamp.toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => downloadRecording(recording)}><Download className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteRecording(recording.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};