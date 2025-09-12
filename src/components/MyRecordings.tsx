import React, { useState, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Pause, Download, Trash2, FolderOpen } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Recording } from '@/App'; // Import the shared Recording type

interface MyRecordingsProps {
  recordings: Recording[];
  setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>;
}

const MyRecordings: React.FC<MyRecordingsProps> = ({ recordings, setRecordings }) => {
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

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
            <p className="mt-1 text-sm text-muted-foreground">Go to the Voice Studio to make your first recording.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recordings.map((recording) => (
              <div key={recording.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Button size="sm" variant="ghost" onClick={() => nowPlaying === recording.id ? pausePlayback() : playRecording(recording)}>
                    {nowPlaying === recording.id ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <div>
                    <p className="font-medium">{recording.name}</p>
                    <p className="text-sm text-muted-foreground">{formatTime(recording.duration)} • {recording.timestamp.toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" onClick={() => downloadRecording(recording)}><Download className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteRecording(recording.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MyRecordings;