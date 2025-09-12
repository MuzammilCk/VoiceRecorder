import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Filter,
  Calendar,
  Clock,
  Users,
  Mic,
  Brain,
  Sparkles,
  Play,
  BookOpen,
  TrendingUp
} from 'lucide-react';

const mockSearchResults = [
    { id: 1, title: 'Q3 Project Kick-off Meeting', snippet: '...we need to finalize the UI/UX design by next Friday...', timestamp: '05:32', speaker: 'Alice' },
    { id: 2, title: 'Marketing Sync', snippet: '...the pre-launch campaign will focus on social media engagement...', timestamp: '12:15', speaker: 'Bob' },
    { id: 3, title: 'User Testing Feedback', snippet: '...users found the design intuitive but requested a dark mode...', timestamp: '08:45', speaker: 'Charlie' },
];
const trendingTopics = ["UI/UX Design", "Q4 Roadmap", "User Feedback"];

const quickFilters = [
  { label: 'This Week', value: 'week', icon: Calendar },
  { label: 'Meetings', value: 'meetings', icon: Users },
  { label: 'High Confidence', value: 'confidence', icon: Brain },
  { label: 'Action Items', value: 'actions', icon: Sparkles }
];

export const SearchDiscovery = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const toggleFilter = (filter: string) => {
    setActiveFilters(prev =>
      prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Search & Discovery
        </h1>
        <p className="text-muted-foreground">
          Find insights across all your conversations with AI-powered semantic search
        </p>
      </div>

      {/* Search Bar */}
      <Card className="glass p-6">
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for 'UI/UX design'..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg bg-background/50 border-border/50"
            />
            <Button
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
              size="sm"
            >
              <Brain className="w-4 h-4 mr-2" />
              AI Search
            </Button>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2">
            {quickFilters.map((filter) => (
              <Button
                key={filter.value}
                variant={activeFilters.includes(filter.value) ? "default" : "outline"}
                size="sm"
                onClick={() => toggleFilter(filter.value)}
                className="h-8"
              >
                <filter.icon className="w-4 h-4 mr-2" />
                {filter.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Search Results */}
        <div className="lg:col-span-3 space-y-4">
          {searchQuery ? (
            <Card className="glass p-6">
                <h3 className="text-lg font-semibold mb-4">Search Results for "{searchQuery}"</h3>
                <div className="space-y-4">
                    {mockSearchResults.map(result => (
                        <div key={result.id} className="p-4 bg-secondary/30 rounded-lg border border-border/30">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h4 className="font-semibold">{result.title}</h4>
                                    <p className="text-sm text-muted-foreground italic mt-1">"{result.snippet}"</p>
                                </div>
                                <Button size="sm" variant="ghost"><Play className="w-4 h-4" /></Button>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                                <span><Clock className="w-3 h-3 inline-block mr-1" />{result.timestamp}</span>
                                <span><Mic className="w-3 h-3 inline-block mr-1" />{result.speaker}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
          ) : (
            <Card className="glass p-12 text-center">
              <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">Discover Your Voice Content</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Use natural language to search through your recordings. Try searching for "UI/UX design" to see mock results.
                </p>
                <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
                  {trendingTopics.map(topic => <Badge key={topic} variant="secondary">{topic}</Badge>)}
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};