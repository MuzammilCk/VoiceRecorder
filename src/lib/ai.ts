import { Recording } from '@/App';

export interface Insight {
  id: string;
  title: string;
  duration: number;
  participants: number; // Placeholder
  sentiment: 'positive' | 'neutral' | 'negative'; // Basic sentiment
  keyPoints: string[];
  actionItems: string[];
}

// A simple list of keywords to identify potential action items
const actionItemKeywords = ['i will', 'we will', 'we need to', 'let\'s', 'assign', 'task'];

// A very basic sentiment analysis based on keywords
const positiveWords = ['great', 'excellent', 'good', 'awesome', 'love', 'pleasure'];
const negativeWords = ['problem', 'issue', 'bad', 'terrible', 'hate', 'difficult'];

function getSentiment(transcript: string): 'positive' | 'neutral' | 'negative' {
  const words = transcript.toLowerCase().split(/\s+/);
  let score = 0;
  words.forEach(word => {
    if (positiveWords.includes(word)) score++;
    if (negativeWords.includes(word)) score--;
  });
  if (score > 0) return 'positive';
  if (score < 0) return 'negative';
  return 'neutral';
}

export function generateInsights(recording: Recording): Insight {
  const transcript = recording.transcript || '';
  const sentences = transcript.match(/[^.!?]+[.!?]+/g) || [];

  const keyPoints = sentences
    .filter(sentence => sentence.length > 50) // Extract longer sentences as key points
    .map(s => s.trim());

  const actionItems = sentences
    .filter(sentence => actionItemKeywords.some(keyword => sentence.toLowerCase().includes(keyword)))
    .map(s => s.trim());

  return {
    id: recording.id,
    title: recording.name,
    duration: recording.duration,
    participants: 1, // Placeholder, as we can't determine this from the audio
    sentiment: getSentiment(transcript),
    keyPoints: keyPoints.length > 0 ? keyPoints : ["No significant key points detected."],
    actionItems: actionItems.length > 0 ? actionItems : ["No action items detected."],
  };
}