import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Upload, 
  Loader2, 
  Heart, 
  Zap, 
  Smile, 
  Frown, 
  Meh,
  AlertTriangle,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { emotionAnalysisService, EmotionAnalysisResult, EmotionScore } from '@/lib/emotionAnalysis';
import { Recording } from '@/App';

interface ToneAnalyzerProps {
  recordings: Recording[];
}

export const ToneAnalyzer: React.FC<ToneAnalyzerProps> = ({ recordings }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysisResult | null>(null);
  const [selectedRecording, setSelectedRecording] = useState<Recording | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [activeTab, setActiveTab] = useState('upload');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Initialize Hume AI service
  React.useEffect(() => {
    const envApiKey = import.meta.env.VITE_HUME_API_KEY || '';
    if (envApiKey) {
      emotionAnalysisService.setHumeApiKey(envApiKey);
    }
  }, []);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg', 'audio/m4a'];
      if (!validTypes.some(type => file.type.includes(type.split('/')[1]))) {
        toast({
          title: "Invalid File Type",
          description: "Please upload an audio file (WAV, MP3, WebM, OGG, M4A)",
          variant: "destructive"
        });
        return;
      }

      // Check file size (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "Please upload an audio file smaller than 50MB",
          variant: "destructive"
        });
        return;
      }

      setUploadedFile(file);
      setSelectedRecording(null);
      toast({
        title: "File Uploaded",
        description: `Ready to analyze: ${file.name}`
      });
    }
  }, [toast]);

  const analyzeEmotion = async (audioBlob: Blob, fileName: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const result = await emotionAnalysisService.analyzeEmotion(audioBlob);
      setAnalysisResult(result);
      
      toast({
        title: "Analysis Complete",
        description: `Emotion analysis completed for ${fileName}`,
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeUploadedFile = () => {
    if (!uploadedFile) return;
    analyzeEmotion(uploadedFile, uploadedFile.name);
  };

  const handleAnalyzeRecording = (recording: Recording) => {
    setSelectedRecording(recording);
    setUploadedFile(null);
    analyzeEmotion(recording.blob, recording.name);
  };

  const getEmotionIcon = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happiness':
      case 'joy':
      case 'excitement':
        return <Smile className="w-5 h-5 text-yellow-500" />;
      case 'sadness':
      case 'sorrow':
      case 'melancholy':
        return <Frown className="w-5 h-5 text-blue-500" />;
      case 'anger':
      case 'rage':
      case 'frustration':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'fear':
      case 'anxiety':
        return <AlertTriangle className="w-5 h-5 text-purple-500" />;
      case 'calm':
      case 'neutral':
        return <Meh className="w-5 h-5 text-gray-500" />;
      case 'confidence':
        return <Zap className="w-5 h-5 text-green-500" />;
      case 'surprise':
        return <Eye className="w-5 h-5 text-orange-500" />;
      case 'disgust':
      case 'contempt':
        return <EyeOff className="w-5 h-5 text-brown-500" />;
      default:
        return <Heart className="w-5 h-5 text-pink-500" />;
    }
  };

  const getEmotionColor = (emotion: string) => {
    switch (emotion.toLowerCase()) {
      case 'happiness':
      case 'joy':
      case 'excitement':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'sadness':
      case 'sorrow':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'anger':
      case 'rage':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'fear':
      case 'anxiety':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'calm':
      case 'neutral':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-pink-100 text-pink-800 border-pink-200';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass border-border/50 p-8">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Emotion Analyzer
                </h1>
                <p className="text-muted-foreground">AI-Powered Voice Emotion Detection</p>
              </div>
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Audio</TabsTrigger>
              <TabsTrigger value="recordings">My Recordings</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">Upload Audio File</h3>
                <p className="text-muted-foreground mb-4">
                  Support formats: WAV, MP3, WebM, OGG, M4A (Max 50MB)
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Button 
                  onClick={() => fileInputRef.current?.click()}
                  className="mb-4"
                >
                  Choose Audio File
                </Button>
                {uploadedFile && (
                  <div className="mt-4 p-4 bg-secondary/50 rounded-lg">
                    <p className="font-medium">{uploadedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                    <Button 
                      onClick={handleAnalyzeUploadedFile}
                      disabled={isAnalyzing}
                      className="mt-2"
                    >
                      {isAnalyzing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Analyze Emotions
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="recordings" className="space-y-4">
              {recordings.length > 0 ? (
                <div className="space-y-3">
                  {recordings.map((recording) => (
                    <div 
                      key={recording.id} 
                      className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg border border-border/30"
                    >
                      <div>
                        <p className="font-medium">{recording.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')} • {recording.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAnalyzeRecording(recording)}
                        disabled={isAnalyzing}
                      >
                        {isAnalyzing && selectedRecording?.id === recording.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Brain className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No recordings available for analysis</p>
                </div>
              )}
            </TabsContent>

          </Tabs>
        </div>
      </Card>

      {analysisResult && (
        <Card className="glass border-border/50 p-6">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Emotion Analysis Results</h2>
              <Badge variant="outline" className="capitalize">
                {analysisResult.provider} analysis
              </Badge>
            </div>

            {analysisResult.error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600">{analysisResult.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    {getEmotionIcon(analysisResult.dominantEmotion)}
                    <h3 className="text-2xl font-bold capitalize">
                      {analysisResult.dominantEmotion}
                    </h3>
                  </div>
                  <p className="text-muted-foreground">
                    Confidence: {(analysisResult.confidence * 100).toFixed(1)}%
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold">Detected Emotions</h4>
                  {analysisResult.emotions.map((emotion, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getEmotionIcon(emotion.emotion)}
                          <span className="font-medium capitalize">{emotion.emotion}</span>
                        </div>
                        <Badge className={getEmotionColor(emotion.emotion)}>
                          {(emotion.confidence * 100).toFixed(1)}%
                        </Badge>
                      </div>
                      <Progress value={emotion.confidence * 100} className="h-2" />
                      <p className="text-sm text-muted-foreground">{emotion.description}</p>
                    </div>
                  ))}
                </div>

                {analysisResult.audioFeatures && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Audio Features</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Pitch:</span>
                        <span className="ml-2 font-mono">{analysisResult.audioFeatures.pitch.toFixed(1)} Hz</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Energy:</span>
                        <span className="ml-2 font-mono">{analysisResult.audioFeatures.energy.toFixed(3)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Brightness:</span>
                        <span className="ml-2 font-mono">{analysisResult.audioFeatures.spectralCentroid.toFixed(0)} Hz</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Voice Activity:</span>
                        <span className="ml-2 font-mono">{(analysisResult.audioFeatures.zeroCrossingRate * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
