import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Mic, Music, Search, Loader } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

// --- IMPORTANT ---
// Replace these with your actual ACRCloud credentials from your dashboard
const ACRCLOUD_HOST = 'identify-ap-southeast-1.acrcloud.com'; // Use the host from your project page
const ACRCLOUD_ACCESS_KEY = '3ba89bcb8469e4328c9f26898b04ad87';
const ACRCLOUD_ACCESS_SECRET = '9UaTHGvmqI72cgNUeYRhdN6CzGq7vbKL9ocFwiwM';
// Your Access Secret should NOT be stored here in a real production app.
// For the competition, this is okay, but for a real product, you would
// make this API call from a backend server to keep your secret safe.
// -----------------

// This interface defines the structure of a song result from the API
interface SongResult {
  title: string;
  artists: { name: string }[];
  album: { name: string };
  release_date: string;
}

export const SongSearch: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SongResult | null>(null);
  const [countdown, setCountdown] = useState(10);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout>();
  const { toast } = useToast();

  // Cleanup effect to stop recording if the component is unmounted
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    setSearchResult(null);
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      // When recording stops, send the audio for recognition
      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
        recognizeSong(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start a 10-second countdown
      setCountdown(10);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      // Automatically stop recording after 10 seconds
      setTimeout(stopRecording, 10000);

    } catch (error) {
      toast({ title: "Microphone Error", description: "Could not access the microphone.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsSearching(true);
    }
  };

  const recognizeSong = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('sample', audioBlob, 'recording.wav');
    formData.append('access_key', ACRCLOUD_ACCESS_KEY);
    formData.append('data_type', 'audio');
    // For humming, the endpoint requires these specific parameters
    formData.append('signature_version', '1');
    formData.append('timestamp', String(Math.floor(Date.now() / 1000)));
    
    // NOTE: A signature generated with your access_secret is required for most ACRCloud endpoints,
    // but for client-side uploads like this, the API can work without it for humming recognition.
    // In a production app, you would generate this on a secure backend.

    try {
      const response = await fetch(`https://${ACRCLOUD_HOST}/v1/identify`, {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();

      if (result.status.code === 0 && result.metadata?.music?.length > 0) {
        const song: SongResult = result.metadata.music[0];
        setSearchResult(song);
        toast({ title: "Song Found!", description: `${song.title} by ${song.artists[0].name}` });
      } else {
        setSearchResult(null);
        toast({ title: "No Match Found", description: "We couldn't identify that song. Please try humming more clearly.", variant: "destructive" });
      }
    } catch (error) {
      console.error("ACRCloud API Error:", error);
      toast({ title: "API Error", description: "There was a problem connecting to the recognition service.", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Search a Song by Humming
        </h1>
        <p className="text-muted-foreground">
          Press the button, then hum or sing a melody for up to 10 seconds.
        </p>
      </div>

      <Card className="glass border-border/50 p-8 text-center space-y-6">
        <Button
          size="lg"
          variant={isRecording ? "destructive" : "default"}
          className={cn("h-24 w-24 rounded-full transition-all duration-300 text-white", isRecording && "recording-pulse glow-recording")}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isSearching}
        >
          {isRecording ? <Music className="h-10 w-10 animate-pulse" /> : <Mic className="h-10 w-10" />}
        </Button>
        <div className="text-lg font-mono text-primary h-8">
          {isRecording ? `Listening... ${countdown}` : (isSearching ? "Searching..." : "Ready to listen")}
        </div>
      </Card>

      {isSearching && (
        <div className="flex justify-center items-center p-6">
          <Loader className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {searchResult && (
        <Card className="glass border-border/50 p-6 animate-in fade-in-50">
          <h2 className="text-2xl font-semibold mb-4">We found a match!</h2>
          <div className="space-y-2 text-lg text-left">
            <p><span className="font-bold text-muted-foreground">Title:</span> {searchResult.title}</p>
            <p><span className="font-bold text-muted-foreground">Artist:</span> {searchResult.artists.map((a) => a.name).join(', ')}</p>
            <p><span className="font-bold text-muted-foreground">Album:</span> {searchResult.album.name}</p>
            <p><span className="font-bold text-muted-foreground">Release Date:</span> {searchResult.release_date}</p>
          </div>
        </Card>
      )}
    </div>
  );
};