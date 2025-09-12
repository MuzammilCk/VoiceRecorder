import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Play } from 'lucide-react';

const mockSharedRecordings = [
  { id: 'shared1', name: 'Team Sync - Project Phoenix', sharedBy: 'Alice', duration: '32:15' },
  { id: 'shared2', name: 'Client Feedback Session', sharedBy: 'Bob', duration: '45:50' },
];

const SharedWithMe = () => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Shared with Me</h1>
        <p className="text-muted-foreground">Recordings shared with you by your team.</p>
      </div>
      <Card className="glass p-6">
        {mockSharedRecordings.length === 0 ? (
          <div className="text-center py-12">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nothing Shared Yet</h3>
            <p className="mt-1 text-sm text-muted-foreground">When others share recordings with you, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {mockSharedRecordings.map((recording) => (
              <div key={recording.id} className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Button size="sm" variant="ghost"><Play className="h-4 w-4" /></Button>
                  <div>
                    <p className="font-medium">{recording.name}</p>
                    <p className="text-sm text-muted-foreground">Shared by {recording.sharedBy} • {recording.duration}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default SharedWithMe;