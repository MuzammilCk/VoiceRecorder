import { EmotionAnalysisResult } from '@/lib/emotionAnalysis';

export interface Word {
    text: string;
    start: number;
    end: number;
    confidence: number;
    speaker?: string;
}

export interface Utterance {
    speaker: string;
    text: string;
    start: number;
    end: number;
    words?: Word[];
}

export interface Recording {
    id: string;
    name: string;
    blob: Blob | string; // Helper for when it's just a URL string (e.g. form DB)
    timestamp: Date;
    duration: number;
    transcript?: string;
    utterances?: Utterance[];
    words?: Word[]; // Full list of words for Karaoke
    audioUrl?: string; // Supabase/Cloud URL
    emotionAnalysis?: EmotionAnalysisResult;
    embedding?: number[]; // PGVector embedding
}
