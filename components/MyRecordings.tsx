import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Trash2, FolderOpen, FileText, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recording } from '@/types';
import { TranscribeRecording } from './TranscribeRecording';
import { AIInsights } from './AIInsights';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { WaveformPlayer } from './WaveformPlayer';

interface MyRecordingsProps {
  recordings: Recording[];
  setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>;
}

const MyRecordings: React.FC<MyRecordingsProps> = ({ recordings, setRecordings }) => {
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0); // Karaoke time
  const [expandedRecordings, setExpandedRecordings] = useState<Set<string>>(new Set());
  const [whisperApiKey, setWhisperApiKey] = useState('');
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Load Whisper API key from localStorage
  useEffect(() => {
    const savedApiKey = localStorage.getItem('whisperApiKey');
    if (savedApiKey) setWhisperApiKey(savedApiKey);
  }, []);

  const playRecording = (recording: Recording) => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(typeof recording.blob === 'string' ? recording.blob : URL.createObjectURL(recording.blob));
    audioRef.current = audio;

    audio.onplay = () => setNowPlaying(recording.id);
    audio.onpause = () => setNowPlaying(null);
    audio.onended = () => setNowPlaying(null);

    audio.play();
  };

  const pausePlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(r => r.id !== id));
    toast({ title: "Recording Deleted" });
  };

  const downloadRecording = (recording: Recording) => {
    const url = typeof recording.blob === 'string' ? recording.blob : URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    if (typeof recording.blob !== 'string') URL.revokeObjectURL(url);
  };

  const toggleExpanded = (recordingId: string) => {
    setExpandedRecordings(prev => {
      const newSet = new Set(prev);
      if (newSet.has(recordingId)) {
        newSet.delete(recordingId);
      } else {
        newSet.add(recordingId);
      }
      return newSet;
    });
  };

  const handleTranscriptionComplete = (recordingId: string, transcript: string, utterances?: any[], words?: any[]) => {
    setRecordings(prev => prev.map(recording =>
      recording.id === recordingId
        ? { ...recording, transcript, utterances, words }
        : recording
    ));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Recordings</h1>
        <p className="text-muted-foreground">Browse and manage all your recordings.</p>
      </div>
      <Card className="glass p-6">
        {recordings.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Recordings Yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Go to the Voice Studio to make your first recording.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((recording) => (
              <div key={recording.id} className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => nowPlaying === recording.id ? pausePlayback() : playRecording(recording)}
                    >
                      {nowPlaying === recording.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </Button>
                    <div>
                      <p className="font-medium">{recording.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(recording.duration)} • {recording.timestamp.toLocaleDateString()}
                        {recording.transcript && recording.transcript.trim() && (
                          <span className="ml-2 text-green-600">• Transcribed</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleExpanded(recording.id)}
                      className={expandedRecordings.has(recording.id) ? "bg-accent/50" : ""}
                    >
                      {recording.transcript ? <Sparkles className="h-4 w-4 text-purple-500" /> : <FileText className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => downloadRecording(recording)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteRecording(recording.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {expandedRecordings.has(recording.id) && (
                  <div className="mt-2 p-4 border border-border/50 rounded-lg bg-background/50">
                    {recording.transcript && recording.transcript.trim() ? (
                      <div className="space-y-4">
                        {/* Waveform Player - Only render if expanded to save resources */}
                        <div className="bg-secondary/30 rounded-lg p-2">
                          <WaveformPlayer
                            audioUrl={recording.audioUrl || recording.blob}
                            onTimeUpdate={(t) => setPlaybackTime(t)}
                            height={60}
                          />
                        </div>

                        <Tabs defaultValue="transcript" className="w-full">
                          <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="transcript">Transcript (Karaoke)</TabsTrigger>
                            <TabsTrigger value="chat">AI Details</TabsTrigger>
                          </TabsList>

                          <TabsContent value="transcript" className="p-4 bg-muted/30 rounded-lg mt-2 min-h-[300px] max-h-[500px] overflow-y-auto">
                            {/* Karaoke Mode */}
                            {recording.words && recording.words.length > 0 ? (
                              <div className="leading-relaxed text-lg flex flex-wrap gap-1.5">
                                {recording.words.map((word, idx) => {
                                  // Words are in ms usually from AssemblyAI? No, it's milliseconds typically.
                                  // Wait, AssemblyAI 'words' start/end are in ms. 
                                  // Helper: check if we need to divide by 1000. 
                                  // Standard AssemblyAI response: start: 120, end: 450 (ms).
                                  // Wavesurfer returns seconds (e.g. 1.2). 
                                  // So we need to compare playbackTime * 1000.
                                  const start = word.start / 1000;
                                  const end = word.end / 1000;
                                  const isActive = playbackTime >= start && playbackTime <= end;

                                  return (
                                    <span
                                      key={idx}
                                      className={`transition-all duration-150 px-1 rounded cursor-pointer hover:bg-primary/20 ${isActive
                                          ? 'bg-primary/20 text-primary font-bold scale-105 shadow-sm'
                                          : 'text-foreground/80'
                                        }`}
                                      title={`${start.toFixed(2)}s - ${end.toFixed(2)}s`}
                                    >
                                      {word.text}
                                    </span>
                                  );
                                })}
                              </div>
                            ) : recording.utterances && recording.utterances.length > 0 ? (
                              // Fallback to Speaker Diarization if no words
                              <div className="space-y-4">
                                {recording.utterances.map((u, i) => (
                                  <div key={i} className="flex gap-4">
                                    <div className="min-w-[80px] font-semibold text-xs text-blue-600 uppercase pt-1">
                                      Speaker {u.speaker}
                                    </div>
                                    <div className="text-sm leading-relaxed">
                                      {u.text}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{recording.transcript}</p>
                            )}
                          </TabsContent>
                          <TabsContent value="chat" className="mt-2">
                            <AIInsights recording={recording} />
                          </TabsContent>
                        </Tabs>
                      </div>
                    ) : (
                      <TranscribeRecording
                        recording={recording}
                        onTranscriptionComplete={handleTranscriptionComplete}
                        whisperApiKey={whisperApiKey}
                        language="en-US"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyRecordings;