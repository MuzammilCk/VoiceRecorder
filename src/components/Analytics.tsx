import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  Mic,
  Brain,
  Calendar,
  Download,
  Share,
  Filter
} from 'lucide-react';

// Real analytics data will be loaded from backend
const analyticsData = {
  totalRecordings: 1,
  totalDuration: 932, // in seconds
  avgDuration: 932,
  sentiment: { positive: 80, neutral: 15, negative: 5 },
  keywords: ['UI/UX', 'Marketing', 'User Testing'],
};

export const Analytics = () => {

  if (!analyticsData) {
    return (
        <Card className="glass p-12 text-center">
            <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <TrendingUp className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">No Analytics Data Yet</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Start recording to see detailed analytics about your voice recordings, AI insights performance, and usage patterns.
                </p>
                <Button className="mt-4">
                    <Mic className="w-4 h-4 mr-2" />
                    Start Recording
                </Button>
            </div>
        </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="space-y-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
            Usage patterns, performance metrics, and AI insights.
            </p>
        </div>
        <div className="flex gap-2">
            <Button variant="outline"><Filter className="w-4 h-4 mr-2" /> Filter</Button>
            <Button><Download className="w-4 h-4 mr-2" /> Export</Button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="glass p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground">Total Recordings</h3>
                <Mic className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mt-2">{analyticsData.totalRecordings}</p>
        </Card>
        <Card className="glass p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground">Total Duration</h3>
                <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mt-2">{Math.floor(analyticsData.totalDuration / 60)}m {analyticsData.totalDuration % 60}s</p>
        </Card>
        <Card className="glass p-6">
            <div className="flex items-center justify-between">
                <h3 className="text-muted-foreground">Avg. Duration</h3>
                <Clock className="w-5 h-5 text-primary" />
            </div>
            <p className="text-3xl font-bold mt-2">{Math.floor(analyticsData.avgDuration / 60)}m {analyticsData.avgDuration % 60}s</p>
        </Card>
      </div>

      {/* Deeper Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4">Sentiment Analysis</h3>
            <div className="space-y-3">
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm">Positive</span>
                        <span className="text-sm">{analyticsData.sentiment.positive}%</span>
                    </div>
                    <Progress value={analyticsData.sentiment.positive} className="h-2" />
                </div>
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm">Neutral</span>
                        <span className="text-sm">{analyticsData.sentiment.neutral}%</span>
                    </div>
                    <Progress value={analyticsData.sentiment.neutral} className="h-2" />
                </div>
                <div>
                    <div className="flex justify-between mb-1">
                        <span className="text-sm">Negative</span>
                        <span className="text-sm">{analyticsData.sentiment.negative}%</span>
                    </div>
                    <Progress value={analyticsData.sentiment.negative} className="h-2" />
                </div>
            </div>
        </Card>
        <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4">Top Keywords</h3>
            <div className="flex flex-wrap gap-2">
                {analyticsData.keywords.map(keyword => <Badge key={keyword} variant="secondary">{keyword}</Badge>)}
            </div>
        </Card>
      </div>

    </div>
  );
};