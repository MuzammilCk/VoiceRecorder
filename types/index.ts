import { EmotionAnalysisResult } from '@/lib/emotionAnalysis';

export interface Recording {
    id: string;
    name: string;
    blob: Blob;
    duration: number;
    timestamp: Date;
    transcript?: string;
    audioUrl?: string;
    emotionAnalysis?: EmotionAnalysisResult;
}
