import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Brain,
  Clock,
  Target,
  Lightbulb,
  Users,
  Mic
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Recording } from '@/App';
import { Insight, generateInsights } from '@/lib/ai';

interface AIInsightsProps {
  recordings: Recording[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ recordings }) => {
  const [selectedRecordingId, setSelectedRecordingId] = useState<string | null>(recordings[0]?.id || null);

  const selectedInsight = useMemo<Insight | null>(() => {
    const recording = recordings.find(r => r.id === selectedRecordingId);
    if (recording) {
      return generateInsights(recording);
    }
    return null;
  }, [selectedRecordingId, recordings]);

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'default';
      case 'negative': return 'destructive';
      default: return 'secondary';
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (recordings.length === 0) {
    return (
        <Card className="glass p-12 text-center">
            <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Brain className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">No Recordings to Analyze</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Record something in the Voice Studio to generate AI-powered insights.
                </p>
                <Button className="mt-4" onClick={() => window.location.href = '/'}>
                    <Mic className="w-4 h-4 mr-2" />
                    Go to Voice Studio
                </Button>
            </div>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          AI Insights
        </h1>
        <p className="text-muted-foreground">
          Select a recording to analyze its key points, action items, and sentiment.
        </p>
      </div>

      <Card className="glass p-6">
        <div className="mb-6">
            <Select onValueChange={setSelectedRecordingId} defaultValue={selectedRecordingId || undefined}>
              <SelectTrigger className="w-full md:w-1/2">
                <SelectValue placeholder="Select a recording to analyze..." />
              </SelectTrigger>
              <SelectContent>
                {recordings.map((rec) => (
                  <SelectItem key={rec.id} value={rec.id}>{rec.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
        </div>

        {selectedInsight ? (
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold">{selectedInsight.title}</h2>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {formatTime(selectedInsight.duration)}</span>
                  <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {selectedInsight.participants} Participant(s)</span>
                </div>
              </div>
              <Badge variant={getSentimentBadgeVariant(selectedInsight.sentiment)} className="capitalize">
                {selectedInsight.sentiment}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-secondary/30 p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3"><Lightbulb className="w-5 h-5 text-primary" />Key Points</h3>
                <ul className="space-y-2 list-disc pl-5 text-sm">
                  {selectedInsight.keyPoints.map((point, index) => <li key={index}>{point}</li>)}
                </ul>
              </Card>
              <Card className="bg-secondary/30 p-4">
                  <h3 className="font-semibold flex items-center gap-2 mb-3"><Target className="w-5 h-5 text-primary" />Action Items</h3>
                  <ul className="space-y-2 list-disc pl-5 text-sm">
                      {selectedInsight.actionItems.map((item, index) => (
                          <li key={index}>{item}</li>
                      ))}
                  </ul>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Please select a recording to view its insights.</p>
          </div>
        )}
      </Card>
    </div>
  );
};