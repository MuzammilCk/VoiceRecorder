"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mic, Square, Play, Pause, Download, Trash2, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { LanguageSelector } from './LanguageSelector';
import { Recording } from '@/types'; // Import the shared Recording type
import { Input } from '@/components/ui/input'; // Import the Input component
import { transcriptionService } from '@/lib/transcription';
import { useTranscription } from '@/hooks/useTranscription';

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
import { useRecordings } from '@/components/Providers';

export const VoiceRecorder: React.FC = () => {
  const { recordings, saveRecording, updateRecording, deleteRecording } = useRecordings();
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioLevels, setAudioLevels] = useState<number[]>(new Array(40).fill(0));
  const [isSaving, setIsSaving] = useState(false);

  // ... (Settings state remains same)
  const [language, setLanguage] = useState('en-US');
  const [recordingName, setRecordingName] = useState('');
  const [useWhisper, setUseWhisper] = useState(false);
  const [whisperApiKey, setWhisperApiKey] = useState('');
  const [useAssemblyAI, setUseAssemblyAI] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  // ... (Hook usage remains same)
  const {
    transcript,
    setTranscript,
    resetTranscript,
    isTranscribing,
    error: transcriptionError,
    startRealTime,
    stopRealTime,
    transcribeFile
  } = useTranscription({
    language,
    useWhisper,
    whisperApiKey,
    useAssemblyAI
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const recordingIntervalRef = useRef<number | null>(null);
  const recordingTimeRef = useRef(0);
  const chunksRef = useRef<BlobPart[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    // Load saved settings from localStorage
    const savedApiKey = localStorage.getItem('whisperApiKey');
    const savedUseWhisper = localStorage.getItem('useWhisper') === 'true';
    const savedUseAssemblyAI = localStorage.getItem('useAssemblyAI') !== 'false';
    const savedLanguage = localStorage.getItem('transcriptionLanguage') || 'en-US';

    if (savedApiKey) setWhisperApiKey(savedApiKey);
    if (savedUseWhisper) setUseWhisper(savedUseWhisper);
    setUseAssemblyAI(savedUseAssemblyAI);
    setLanguage(savedLanguage);

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (recordingIntervalRef.current) clearInterval(recordingIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      stopRealTime();
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('whisperApiKey', whisperApiKey);
    localStorage.setItem('useWhisper', useWhisper.toString());
    localStorage.setItem('useAssemblyAI', useAssemblyAI.toString());
    localStorage.setItem('transcriptionLanguage', language);
  }, [whisperApiKey, useWhisper, useAssemblyAI, language]);

  const startRecording = async () => {
    resetTranscript();
    setCurrentRecording(null);
    chunksRef.current = [];

    if (useWhisper && !useAssemblyAI && !whisperApiKey.trim()) {
      toast({
        title: "API Key Required",
        description: "Please configure your OpenAI API key in settings to use Whisper transcription.",
        variant: "destructive"
      });
      return;
    }

    if (useAssemblyAI) {
      console.log('Using AssemblyAI for transcription');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: false, // Disabling aggressive suppression often improves voice clarity
          autoGainControl: true,
          sampleRate: 48000, // CD quality
          channelCount: 1
        }
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

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const timestamp = new Date();

        let name = recordingName.trim();
        if (!name) {
          const year = timestamp.getFullYear();
          const month = String(timestamp.getMonth() + 1).padStart(2, '0');
          const day = String(timestamp.getDate()).padStart(2, '0');
          const hours = String(timestamp.getHours()).padStart(2, '0');
          const minutes = String(timestamp.getMinutes()).padStart(2, '0');
          const seconds = String(timestamp.getSeconds()).padStart(2, '0');
          name = `Recording ${year}-${month}-${day} ${hours}.${minutes}.${seconds}`;
        }

        setIsSaving(true);
        let savedRecording: Recording;

        try {
          // 1. Immediate Save (Optimistic UI)
          const initialRecording: Recording = {
            id: Date.now().toString(),
            name: name,
            blob,
            duration: recordingTimeRef.current,
            timestamp: timestamp,
            transcript: ''
          };

          savedRecording = await saveRecording(initialRecording);
          setCurrentRecording(savedRecording);

          toast({
            title: "Recording Saved",
            description: "Audio saved. Starting transcription..."
          });

          setIsSaving(false);
          setRecordingName(''); // Reset name field

          // 2. Background Transcription
          transcribeFile(blob).then(async (result) => {
            if (result.error) {
              console.error('Transcription error:', result.error);
              toast({ variant: 'destructive', title: 'Transcription Failed', description: result.error });
            } else {
              toast({ title: "Transcription Complete", description: "Updating recording..." });

              // Update the database with the new transcript
              try {
                await updateRecording(savedRecording.id, {
                  transcript: result.transcript,
                  utterances: result.utterances, // Assuming result has these from previous edits
                  words: result.words
                });
              } catch (uErr) {
                console.error("Failed to update transcript in DB", uErr);
              }
            }
          });

        } catch (err) {
          setIsSaving(false);
          console.error(err);
          toast({
            title: "Save Failed",
            description: "Could not save to Supabase.",
            variant: "destructive"
          });
        }
      };

      startRealTime();

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimeRef.current = 0;
      recordingIntervalRef.current = window.setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          recordingTimeRef.current = newTime;
          return newTime;
        });
      }, 1000);

    } catch (error) {
      toast({
        title: "Recording Error",
        description: "Could not access microphone.",
        variant: "destructive"
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      stopRealTime();
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

    // Support URL or Blob
    let src = recording.audioUrl;
    if (!src && recording.blob) {
      if (typeof recording.blob === 'string') {
        src = recording.blob;
      } else if (recording.blob instanceof Blob) {
        src = URL.createObjectURL(recording.blob);
      }
    }

    if (!src) {
      toast({ title: "Playback Error", description: "No audio source found", variant: "destructive" });
      return;
    }

    const audio = new Audio(src);
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
    let url = recording.audioUrl;
    let isObjectUrl = false;

    if (!url && recording.blob) {
      if (typeof recording.blob === 'string') {
        url = recording.blob;
      } else if (recording.blob instanceof Blob) {
        url = URL.createObjectURL(recording.blob);
        isObjectUrl = true;
      }
    }

    if (!url) return;

    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.webm`;
    a.click();
    if (isObjectUrl) URL.revokeObjectURL(url);
  };

  const handleDelete = async (id: string) => {
    await deleteRecording(id);
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

  const hasTranscript = Boolean(transcript || currentRecording?.transcript);

  return (
    <div className="dashboard-shell">
      <div className="relative z-10 space-y-8">
        <Card className="relative overflow-hidden border border-white/10 p-8 racing-panel panel-edge">
          <div className="absolute -top-14 -left-10 flex rotate-[-18deg] gap-2">
            <span className="h-28 w-4 rounded-full bg-[#36C6FF]" />
            <span className="h-28 w-4 rounded-full bg-[#1A2B4D]" />
            <span className="h-28 w-4 rounded-full bg-[#E11D2E]" />
          </div>
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full racing-highlight blur-3xl opacity-70" />
          <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-3 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-200">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#36C6FF]" />
                signal cockpit
              </div>
              <div className="space-y-3">
                <h1 className="text-4xl font-semibold leading-tight text-white">
                  Voice Recorder
                </h1>
                <p className="text-base text-slate-300">
                  A precision capture deck tuned for clarity, high-contrast monitoring, and instant retrieval.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-white/10 text-slate-100 hover:bg-white/15" variant="secondary">Live waveform</Badge>
                <Badge className="bg-white/10 text-slate-100 hover:bg-white/15" variant="secondary">Transcription-ready</Badge>
                <Badge className="bg-white/10 text-slate-100 hover:bg-white/15" variant="secondary">Cloud saved</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="neo-panel rounded-2xl px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Mode</p>
                  <p className="text-sm font-semibold text-slate-100">{isRecording ? "Live capture" : "Standby"}</p>
                </div>
                <div className="neo-panel rounded-2xl px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Sessions</p>
                  <p className="text-sm font-semibold text-slate-100">{recordings.length} stored</p>
                </div>
                <div className="neo-panel rounded-2xl px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Transcription</p>
                  <p className="text-sm font-semibold text-slate-100">{isTranscribing ? "Processing" : "Ready"}</p>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-center gap-1 h-20 rounded-2xl bg-waveform-bg/80 border border-white/10 p-4">
                {audioLevels.map((level, index) => (
                  <div
                    key={index}
                    className={cn("bg-waveform rounded-full transition-all duration-75", isRecording && "waveform-bar")}
                    style={{ width: '4px', height: `${Math.max(6, level * 100)}px`, animationDelay: `${index * 50}ms` }}
                  />
                ))}
              </div>
              <div className="text-center text-2xl font-mono text-primary">
                {formatTime(recordingTime)}
              </div>
              <div className="w-full space-y-4">
                <Input
                  type="text"
                  placeholder="Name your recording..."
                  value={recordingName}
                  onChange={(e) => setRecordingName(e.target.value)}
                  disabled={isRecording}
                  className="bg-white/5 text-center text-slate-100 placeholder:text-slate-400 border-white/15 focus-visible:ring-primary"
                />
              </div>
              <div className="flex flex-wrap justify-center items-center gap-4">
                <LanguageSelector language={language} setLanguage={setLanguage} isRecording={isRecording} />
                <Button
                  size="lg"
                  variant={isRecording ? "destructive" : "default"}
                  className={cn("h-20 w-20 rounded-full transition-all duration-300", isRecording && "recording-pulse glow-recording")}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isTranscribing}
                >
                  {isTranscribing ? (
                    <Loader2 className="h-8 w-8 animate-spin" />
                  ) : isRecording ? (
                    <Square className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.4fr_0.9fr]">
          <Card className="glass border-white/10 p-6 panel-edge">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Transcript</h2>
              {isTranscribing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Transcribing...
                </div>
              )}
            </div>
            <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {hasTranscript ? (transcript || currentRecording?.transcript) : "Capture a session to generate a live transcript."}
            </p>
            {transcriptionError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{transcriptionError}</p>
              </div>
            )}
            {debugInfo && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-600">{debugInfo}</p>
              </div>
            )}
          </Card>

          <Card className="glass border-white/10 p-6 panel-edge">
            <h2 className="text-xl font-semibold mb-4">Recent Recordings</h2>
            {recordings.length > 0 ? (
              <div className="space-y-3">
                {recordings.map((recording) => (
                  <div key={recording.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-white/10">
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
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(recording.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-6 text-sm text-slate-300">
                No recordings yet. Start a session to build your library.
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
