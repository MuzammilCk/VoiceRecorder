import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Trash2, FolderOpen, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recording } from '@/App';
import { TranscribeRecording } from './TranscribeRecording';

interface MyRecordingsProps {
  recordings: Recording[];
  setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>;
}

const MyRecordings: React.FC<MyRecordingsProps> = ({ recordings, setRecordings }) => {
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
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
    const audio = new Audio(URL.createObjectURL(recording.blob));
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
    const url = URL.createObjectURL(recording.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

  const handleTranscriptionComplete = (recordingId: string, transcript: string) => {
    setRecordings(prev => prev.map(recording =>
      recording.id === recordingId
        ? { ...recording, transcript }
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
                    >
                      <FileText className="h-4 w-4" />
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
                  <div className="ml-4">
                    {recording.transcript && recording.transcript.trim() ? (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm font-medium text-green-800 mb-2">Transcript:</p>
                        <p className="text-sm text-green-700">{recording.transcript}</p>
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