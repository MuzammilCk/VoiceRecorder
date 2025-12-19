import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Search,
  Mic,
  Brain,
  Clock,
} from 'lucide-react';
import { Recording } from '@/types';

interface SearchDiscoveryProps {
  recordings: Recording[];
}

export const SearchDiscovery: React.FC<SearchDiscoveryProps> = ({ recordings }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const searchResults = useMemo(() => {
    if (!searchQuery) {
      return [];
    }
    return recordings.filter(rec =>
      rec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.transcript?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, recordings]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
          Search & Discovery
        </h1>
        <p className="text-muted-foreground">
          Find insights across all your conversations with AI-powered semantic search.
        </p>
      </div>

      {/* Search Bar */}
      <Card className="glass p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by name or transcript content..."
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
      </Card>

      {/* Search Results */}
      <div className="space-y-4">
        {searchQuery && searchResults.length > 0 && (
          <Card className="glass p-6">
            <h3 className="text-lg font-semibold mb-4">Search Results for "{searchQuery}"</h3>
            <div className="space-y-4">
              {searchResults.map(result => (
                <div key={result.id} className="p-4 bg-secondary/30 rounded-lg border border-border/30">
                  <h4 className="font-semibold">{result.name}</h4>
                  <p className="text-sm text-muted-foreground italic mt-1 line-clamp-2">
                    "{result.transcript || 'No transcript available.'}"
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span><Clock className="w-3 h-3 inline-block mr-1" />{formatTime(result.duration)}</span>
                    <span><Mic className="w-3 h-3 inline-block mr-1" />{result.timestamp.toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {searchQuery && searchResults.length === 0 && (
          <Card className="glass p-12 text-center">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">No Results Found</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                No recordings matched your search for "{searchQuery}". Try another keyword.
              </p>
            </div>
          </Card>
        )}
      </div>

    </div>
  );
};