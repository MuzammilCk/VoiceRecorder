import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mic, 
  Music, 
  Search, 
  Loader2, 
  Play, 
  Pause, 
  Volume2, 
  ExternalLink,
  History,
  Settings,
  Zap,
  Headphones,
  MicIcon,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { realSongRecognitionService, RecognitionResult, SongMatch } from '@/lib/realSongRecognition';

type RecognitionMethod = 'acrcloud';

interface RecognitionProgress {
  stage: 'recording' | 'processing' | 'analyzing' | 'searching' | 'complete';
  progress: number;
  message: string;
}

interface SearchHistory {
  id: string;
  timestamp: Date;
  method: RecognitionMethod;
  result: SongMatch | null;
  audio_duration: number;
  confidence?: number;
}

export const SongSearch: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<SongMatch | null>(null);
  const [countdown, setCountdown] = useState(10);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recognitionProgress, setRecognitionProgress] = useState<RecognitionProgress | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<RecognitionMethod>('acrcloud');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [lastError, setLastError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const countdownIntervalRef = useRef<number>();
  const durationIntervalRef = useRef<number>();
  const audioLevelIntervalRef = useRef<number>();
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // Load search history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('songSearchHistory');
    if (savedHistory) {
      try {
        const history = JSON.parse(savedHistory).map((item: any) => ({
          ...item,
          timestamp: new Date(item.timestamp)
        }));
        setSearchHistory(history);
      } catch (error) {
        console.error('Failed to load search history:', error);
      }
    }
  }, []);

  // Save search history to localStorage
  const saveSearchHistory = (result: SongMatch | null, method: RecognitionMethod, duration: number) => {
    const newEntry: SearchHistory = {
      id: Date.now().toString(),
      timestamp: new Date(),
      method,
      result,
      audio_duration: duration,
      confidence: result?.confidence
    };

    const updatedHistory = [newEntry, ...searchHistory.slice(0, 9)]; // Keep last 10 searches
    setSearchHistory(updatedHistory);
    localStorage.setItem('songSearchHistory', JSON.stringify(updatedHistory));
  };

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
      if (audioLevelIntervalRef.current) clearInterval(audioLevelIntervalRef.current);
    };
  }, []);

  const startRecording = async () => {
    setSearchResult(null);
    setRecognitionProgress(null);
    setRecordingDuration(0);
    setLastError(null);
    
    try {
      // Request microphone access with high quality settings
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
          channelCount: 1
        }
      });
      
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });
      mediaRecorderRef.current = mediaRecorder;
      const audioChunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        recognizeSong(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start countdown
      setCountdown(10);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);

      // Start duration tracking
      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 0.1);
      }, 100);

      // Start real audio level monitoring
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      audioLevelIntervalRef.current = setInterval(() => {
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        setAudioLevel(average / 255);
      }, 50);

      // Automatically stop recording after 10 seconds
      setTimeout(stopRecording, 10000);

    } catch (error) {
      console.error('Microphone access error:', error);
      toast({ 
        title: "Microphone Error", 
        description: "Could not access the microphone. Please check your permissions.", 
        variant: "destructive" 
      });
    }
  };

  const stopRecording = () => {
    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    if (durationIntervalRef.current) clearInterval(durationIntervalRef.current);
    if (audioLevelIntervalRef.current) clearInterval(audioLevelIntervalRef.current);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setIsSearching(true);
    }
  };

  const recognizeSong = async (audioBlob: Blob) => {
    try {
      // Show progress stages
      setRecognitionProgress({ stage: 'processing', progress: 20, message: 'Enhancing audio quality...' });
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setRecognitionProgress({ stage: 'analyzing', progress: 40, message: 'Analyzing audio characteristics...' });
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRecognitionProgress({ stage: 'searching', progress: 60, message: `Searching ${getMethodName(selectedMethod)} database...` });
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      setRecognitionProgress({ stage: 'complete', progress: 100, message: 'Recognition complete' });

      // Use real recognition service
      const result: RecognitionResult = await realSongRecognitionService.recognizeSong(audioBlob, selectedMethod);
      
      if (result.success && result.match) {
        setSearchResult(result.match);
        saveSearchHistory(result.match, selectedMethod, recordingDuration);
        toast({ 
          title: "🎵 Song Found!", 
          description: `${result.match.title} by ${result.match.artists[0].name} (${Math.round(result.confidence! * 100)}% confidence)` 
        });
      } else {
        setSearchResult(null);
        setLastError(result.error || "No matching song found");
        saveSearchHistory(null, selectedMethod, recordingDuration);
        toast({ 
          title: "No Match Found", 
          description: result.error || "The audio might not be a recognizable song. Try humming or singing more clearly.", 
          variant: "destructive" 
        });
      }

    } catch (error) {
      console.error("Song recognition error:", error);
      setSearchResult(null);
      setLastError(error instanceof Error ? error.message : "Unknown error");
      saveSearchHistory(null, selectedMethod, recordingDuration);
      toast({ 
        title: "Recognition Error", 
        description: "There was a problem with the recognition service. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSearching(false);
      setRecognitionProgress(null);
    }
  };

  const playPreview = () => {
    if (!searchResult?.preview_url) return;

    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }

    const audio = new Audio(searchResult.preview_url);
    previewAudioRef.current = audio;
    
    audio.onplay = () => setIsPlayingPreview(true);
    audio.onpause = () => setIsPlayingPreview(false);
    audio.onended = () => setIsPlayingPreview(false);
    
    audio.play().catch(error => {
      console.error('Preview playback failed:', error);
      toast({ 
        title: "Preview Error", 
        description: "Could not play the preview.", 
        variant: "destructive" 
      });
    });
  };

  const stopPreview = () => {
    if (previewAudioRef.current) {
      previewAudioRef.current.pause();
    }
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('songSearchHistory');
    toast({ title: "History Cleared" });
  };

  const formatDuration = (seconds: number) => {
    return `${seconds.toFixed(1)}s`;
  };

  const getMethodIcon = (method: RecognitionMethod) => {
    return <Zap className="h-4 w-4" />;
  };

  const getMethodName = (method: RecognitionMethod) => {
    return 'ACRCloud Humming Recognition';
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Smart Song Search
        </h1>
        <p className="text-muted-foreground">
          Hum, sing, or play a melody to find any song instantly
        </p>
      </div>

      <Tabs defaultValue="search" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Main Recording Interface */}
          <Card className="glass border-border/50 p-8 text-center space-y-6">
            <div className="space-y-4">
              {/* Simple Circular Visualizer */}
              <div className="flex items-center justify-center">
                <div className="relative w-48 h-48 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <div className={cn(
                    "w-16 h-16 rounded-full bg-primary transition-all duration-300",
                    isRecording && "animate-pulse scale-110"
                  )} />
                  {isRecording && (
                    <div className="absolute inset-0 rounded-full border-4 border-primary animate-ping" />
                  )}
                </div>
              </div>
              
              <div className="text-lg font-mono text-primary h-8">
                {isRecording ? (
                  <div className="space-y-1">
                    <div>Recording... {countdown}s</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDuration(recordingDuration)}
                    </div>
                  </div>
                ) : isSearching ? (
                  "Processing..."
                ) : (
                  "Ready to record"
                )}
              </div>

              <Button
                size="lg"
                variant={isRecording ? "destructive" : "default"}
                className={cn(
                  "h-16 w-16 rounded-full transition-all duration-300",
                  isRecording && "recording-pulse glow-recording"
                )}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isSearching}
              >
                {isRecording ? (
                  <Music className="h-8 w-8 animate-pulse" />
                ) : (
                  <Mic className="h-8 w-8" />
                )}
              </Button>
            </div>

            {/* Progress Bar */}
            {recognitionProgress && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{recognitionProgress.message}</span>
                  <span>{recognitionProgress.progress}%</span>
                </div>
                <Progress value={recognitionProgress.progress} className="h-2" />
              </div>
            )}

            {/* Simple Audio Visualizer */}
            {isRecording && (
              <div className="flex items-center justify-center gap-1 h-20 bg-waveform-bg rounded-lg p-4">
                {Array.from({ length: 40 }, (_, i) => (
                  <div
                    key={i}
                    className="bg-primary rounded-full transition-all duration-75 animate-pulse"
                    style={{
                      width: '4px',
                      height: `${Math.max(4, audioLevel * 100)}px`,
                      animationDelay: `${i * 20}ms`,
                      opacity: 0.7 + audioLevel * 0.3
                    }}
                  />
                ))}
              </div>
            )}
          </Card>

          {/* No Match Found */}
          {!searchResult && lastError && !isSearching && (
            <Card className="glass border-border/50 p-6 animate-in fade-in-50">
              <div className="space-y-4 text-center">
                <div className="flex items-center justify-center">
                  <AlertCircle className="h-12 w-12 text-muted-foreground" />
                </div>
                <h2 className="text-xl font-semibold">No Match Found</h2>
                <p className="text-muted-foreground">{lastError}</p>
                <div className="text-sm text-muted-foreground">
                  <p>💡 <strong>Tips for better recognition:</strong></p>
                  <ul className="mt-2 space-y-1 text-left">
                    <li>• Hum or sing clearly and loudly</li>
                    <li>• Try different parts of the song</li>
                    <li>• Reduce background noise</li>
                    <li>• Make sure it's a recognizable song</li>
                  </ul>
                </div>
              </div>
            </Card>
          )}

          {/* Search Results */}
          {searchResult && (
            <Card className="glass border-border/50 p-6 animate-in fade-in-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-semibold">🎵 Song Found!</h2>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    {getMethodIcon(selectedMethod)}
                    {getMethodName(selectedMethod)}
                  </Badge>
                </div>
                
                <div className="space-y-3">
                  <div className="text-lg">
                    <span className="font-bold text-muted-foreground">Title:</span> {searchResult.title}
                  </div>
                  <div className="text-lg">
                    <span className="font-bold text-muted-foreground">Artist:</span> {searchResult.artists.map(a => a.name).join(', ')}
                  </div>
                  <div className="text-lg">
                    <span className="font-bold text-muted-foreground">Album:</span> {searchResult.album.name}
                  </div>
                  <div className="text-lg">
                    <span className="font-bold text-muted-foreground">Release Date:</span> {searchResult.release_date}
                  </div>
                  {searchResult.confidence && (
                    <div className="text-lg">
                      <span className="font-bold text-muted-foreground">Confidence:</span> 
                      <Badge variant="outline" className="ml-2">
                        {Math.round(searchResult.confidence * 100)}%
                      </Badge>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4">
                  {searchResult.preview_url && (
                    <Button
                      variant="outline"
                      onClick={isPlayingPreview ? stopPreview : playPreview}
                    >
                      {isPlayingPreview ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                      {isPlayingPreview ? 'Stop Preview' : 'Play Preview'}
                    </Button>
                  )}
                  
                  {searchResult.external_urls?.spotify && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(searchResult.external_urls!.spotify, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in Spotify
                    </Button>
                  )}
                  
                  {searchResult.external_urls?.youtube && (
                    <Button
                      variant="outline"
                      onClick={() => window.open(`https://youtube.com/watch?v=${searchResult.external_urls!.youtube}`, '_blank')}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open in YouTube
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Search History</h3>
            {searchHistory.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearHistory}>
                Clear History
              </Button>
            )}
          </div>
          
          {searchHistory.length === 0 ? (
            <Card className="glass border-border/50 p-8 text-center">
              <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h4 className="text-lg font-semibold mb-2">No Search History</h4>
              <p className="text-muted-foreground">Your song searches will appear here</p>
            </Card>
          ) : (
            <div className="space-y-3">
              {searchHistory.map((entry) => (
                <Card key={entry.id} className="glass border-border/50 p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {entry.result ? (
                          <>
                            <span className="font-medium">{entry.result.title}</span>
                            <Badge variant="secondary" className="flex items-center gap-1">
                              {getMethodIcon(entry.method)}
                              {getMethodName(entry.method)}
                            </Badge>
                          </>
                        ) : (
                          <span className="text-muted-foreground">No match found</span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.timestamp.toLocaleString()} • {formatDuration(entry.audio_duration)}
                        {entry.confidence && ` • ${Math.round(entry.confidence * 100)}% confidence`}
                      </div>
                    </div>
                    {entry.result && (
                      <Button variant="ghost" size="sm">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card className="glass border-border/50 p-6">
            <h3 className="text-lg font-semibold mb-4">Song Recognition Settings</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Music className="h-8 w-8 text-primary" />
                <div>
                  <h4 className="font-medium">Audio Recognition</h4>
                  <p className="text-sm text-muted-foreground">
                    Advanced audio recognition technology for song identification
                  </p>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg">
                <h5 className="font-medium mb-2">How it works:</h5>
                <ul className="space-y-1">
                  <li>• Records 10 seconds of audio for optimal recognition</li>
                  <li>• Analyzes melody patterns and audio fingerprints</li>
                  <li>• Searches extensive music database</li>
                  <li>• Works best with clear humming or singing</li>
                </ul>
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};