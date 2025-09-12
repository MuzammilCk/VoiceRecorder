import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Brain,
  TrendingUp,
  MessageSquare,
  Clock,
  Target,
  Lightbulb,
  Users,
  Zap,
  Mic
} from 'lucide-react';

// Real insights will be loaded from backend
const mockTranscripts = [
  {
    id: 'transcript1',
    title: 'Q3 Project Kick-off Meeting',
    duration: '15:32',
    participants: 4,
    sentiment: 'positive',
    keyPoints: [
      'Finalize the UI/UX design by next Friday.',
      'The initial user testing phase will begin in two weeks.',
      'Marketing team to prepare a pre-launch campaign.',
    ],
    actionItems: [
      { text: 'John to share the final design mockups.', assignedTo: 'John' },
      { text: 'Sarah to set up the user testing sessions.', assignedTo: 'Sarah' },
    ],
  },
];

export const AIInsights = () => {
  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      default: return 'text-yellow-500';
    }
  };

  const getSentimentBadgeVariant = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'default';
      case 'negative': return 'destructive';
      default: return 'secondary';
    }
  };

  if (mockTranscripts.length === 0) {
    return (
        <Card className="glass p-12 text-center">
            <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Brain className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">No Recordings Analyzed Yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Start recording to see AI-powered insights including key points, action items, sentiment analysis, and speaker analytics.
                </p>
                <Button className="mt-4">
                    <Mic className="w-4 h-4 mr-2" />
                    Go to Voice Studio
                </Button>
            </div>
        </Card>
    );
  }

  const insight = mockTranscripts[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          AI Insights
        </h1>
        <p className="text-muted-foreground">
          Discover patterns, extract key insights, and understand the emotional tone of your conversations
        </p>
      </div>

      <Card className="glass p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-xl font-semibold">{insight.title}</h2>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {insight.duration}</span>
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {insight.participants} Participants</span>
            </div>
          </div>
          <Badge variant={getSentimentBadgeVariant(insight.sentiment)} className="capitalize">
            {insight.sentiment}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column: Key Points & Action Items */}
          <div className="space-y-6">
            <Card className="bg-secondary/30">
              <div className="p-4">
                <h3 className="font-semibold flex items-center gap-2 mb-3"><Lightbulb className="w-5 h-5 text-primary" />Key Points</h3>
                <ul className="space-y-2 list-disc pl-5 text-sm">
                  {insight.keyPoints.map((point, index) => <li key={index}>{point}</li>)}
                </ul>
              </div>
            </Card>
            <Card className="bg-secondary/30">
                <div className="p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3"><Target className="w-5 h-5 text-primary" />Action Items</h3>
                    <ul className="space-y-2 list-disc pl-5 text-sm">
                        {insight.actionItems.map((item, index) => (
                            <li key={index}>
                                {item.text} <Badge variant="outline" className="ml-2 text-xs">{item.assignedTo}</Badge>
                            </li>
                        ))}
                    </ul>
                </div>
            </Card>
          </div>

          {/* Right Column: Sentiment & Advanced */}
          <div className="space-y-6">
            <Card className="bg-secondary/30">
                <div className="p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3"><MessageSquare className="w-5 h-5 text-primary" />Sentiment Trend</h3>
                    <div className="h-24 bg-waveform-bg rounded-lg flex items-end p-2">
                        {/* Placeholder for a sentiment chart */}
                        <div className="w-full text-center text-muted-foreground text-sm">Sentiment chart would be displayed here.</div>
                    </div>
                </div>
            </Card>
            <Card className="bg-secondary/30">
                <div className="p-4">
                    <h3 className="font-semibold flex items-center gap-2 mb-3"><Zap className="w-5 h-5 text-primary" />Advanced Analysis</h3>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span>Topic Detection</span>
                            <Badge variant="secondary">UI/UX</Badge>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                            <span>Question Detection</span>
                            <span className="font-medium">3 Questions Asked</span>
                        </div>
                    </div>
                </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  );
};