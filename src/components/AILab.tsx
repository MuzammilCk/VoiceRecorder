import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sparkles, 
  Zap, 
  Brain,
  Wand2,
  Settings,
  Play,
  Clock,
  TrendingUp,
  MessageSquare,
  FileText,
  Users,
  Target
} from 'lucide-react';

const aiFeatures = [
  {
    id: 'transcription',
    title: 'Advanced Transcription',
    description: 'Multi-language transcription with speaker diarization and punctuation',
    icon: FileText,
    status: 'active',
    accuracy: 96.8,
    processTime: '2.3s',
    features: ['50+ Languages', 'Speaker Detection', 'Custom Vocabulary', 'Confidence Scoring']
  },
  {
    id: 'sentiment',
    title: 'Emotion Analysis',
    description: 'Real-time emotion detection and sentiment analysis throughout conversations',
    icon: MessageSquare,
    status: 'beta',
    accuracy: 91.5,
    processTime: '1.8s',
    features: ['Emotion Detection', 'Sentiment Tracking', 'Stress Analysis', 'Engagement Score']
  },
  {
    id: 'insights',
    title: 'Smart Insights',
    description: 'AI-powered key point extraction and action item identification',
    icon: Brain,
    status: 'active',
    accuracy: 94.2,
    processTime: '3.1s',
    features: ['Key Points', 'Action Items', 'Follow-ups', 'Decision Tracking']
  },
  {
    id: 'collaboration',
    title: 'Team Intelligence',
    description: 'Multi-speaker analysis and team dynamics understanding',
    icon: Users,
    status: 'experimental',
    accuracy: 87.3,
    processTime: '4.2s',
    features: ['Speaker Roles', 'Participation Tracking', 'Interruption Analysis', 'Leadership Patterns']
  }
];

const experiments = [
  {
    title: 'Voice Cloning Detection',
    description: 'Identify synthetic or cloned voices in recordings',
    status: 'research',
    confidence: 78,
    eta: '2 weeks'
  },
  {
    title: 'Meeting Quality Score',
    description: 'Rate meeting effectiveness based on conversation patterns',
    status: 'testing',
    confidence: 85,
    eta: '1 week'
  },
  {
    title: 'Auto-Summary Generation',
    description: 'Generate executive summaries from long recordings',
    status: 'ready',
    confidence: 92,
    eta: 'Available'
  }
];

export const AILab = () => {
  const [selectedFeature, setSelectedFeature] = useState(aiFeatures[0]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'beta': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'experimental': return 'bg-purple-500/20 text-purple-500 border-purple-500/30';
      case 'research': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      case 'testing': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'ready': return 'bg-primary/20 text-primary border-primary/30';
      default: return 'bg-muted-foreground/20 text-muted-foreground border-muted-foreground/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent flex items-center gap-3">
          <Sparkles className="w-8 h-8 text-accent" />
          AI Laboratory
        </h1>
        <p className="text-muted-foreground">
          Cutting-edge AI features and experimental capabilities for advanced voice intelligence
        </p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {aiFeatures.map((feature) => (
          <Card 
            key={feature.id}
            className={`glass p-6 cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedFeature.id === feature.id ? 'ring-2 ring-primary glow-primary' : ''
            }`}
            onClick={() => setSelectedFeature(feature)}
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/20 rounded-lg">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">{feature.title}</h3>
                    <Badge className={getStatusColor(feature.status)} variant="outline">
                      {feature.status}
                    </Badge>
                  </div>
                </div>
                <Button size="sm" variant="ghost">
                  <Play className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-muted-foreground text-sm leading-relaxed">
                {feature.description}
              </p>

              <div className="grid grid-cols-2 gap-4 pt-2">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Accuracy</p>
                  <div className="flex items-center gap-2">
                    <Progress value={feature.accuracy} className="h-2 flex-1" />
                    <span className="text-sm font-medium">{feature.accuracy}%</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Avg Process Time</p>
                  <p className="text-sm font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {feature.processTime}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1">
                {feature.features.map((feat, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {feat}
                  </Badge>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Selected Feature Details */}
      <Card className="glass p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <selectedFeature.icon className="w-5 h-5" />
          {selectedFeature.title} - Advanced Configuration
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Performance Metrics</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Accuracy Rate</span>
                  <span className="font-medium">{selectedFeature.accuracy}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Average Processing Time</span>
                  <span className="font-medium">{selectedFeature.processTime}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Success Rate</span>
                  <span className="font-medium">99.2%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Model Information</h4>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>Model: GPT-4o Enhanced + Custom Fine-tuning</p>
                <p>Last Updated: 2024-01-15</p>
                <p>Training Data: 2.3M+ audio hours</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Configuration</h4>
              <div className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="w-4 h-4 mr-2" />
                  Advanced Settings
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Zap className="w-4 h-4 mr-2" />
                  Performance Tuning
                </Button>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Custom Training
                </Button>
              </div>
            </div>

            <div>
              <Button className="w-full">
                <Wand2 className="w-4 h-4 mr-2" />
                Deploy to Production
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Experimental Features */}
      <Card className="glass p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Experimental Features
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {experiments.map((experiment, index) => (
            <div key={index} className="p-4 bg-secondary/30 rounded-lg border border-border/50">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-sm">{experiment.title}</h4>
                  <Badge className={getStatusColor(experiment.status)} variant="outline">
                    {experiment.status}
                  </Badge>
                </div>
                
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {experiment.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Confidence</span>
                    <span>{experiment.confidence}%</span>
                  </div>
                  <Progress value={experiment.confidence} className="h-1" />
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-xs text-muted-foreground">ETA: {experiment.eta}</span>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                    Test
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};