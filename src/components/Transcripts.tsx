import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { Recording } from '@/App';

interface TranscriptsProps {
  recordings: Recording[];
}

const Transcripts: React.FC<TranscriptsProps> = ({ recordings }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Transcripts</h1>
        <p className="text-muted-foreground">Review and search all your generated transcripts.</p>
      </div>
      <Card className="glass p-6">
        {recordings.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No Transcripts Available</h3>
            <p className="mt-1 text-sm text-muted-foreground">Record something with transcription to see it here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recordings.map((recording) => (
              <div key={recording.id} className="p-4 bg-secondary/50 rounded-lg">
                <h4 className="font-semibold">{recording.name}</h4>
                <p className="text-sm text-muted-foreground mt-1 mb-2">{recording.timestamp.toLocaleDateString()}</p>
                <p className="text-sm text-foreground italic p-3 bg-background/50 rounded-md max-h-24 overflow-hidden text-ellipsis">
                  "{recording.transcript || 'No transcript available for this recording.'}"
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default Transcripts;