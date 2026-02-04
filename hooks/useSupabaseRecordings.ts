import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { Recording } from '@/types';
import { useToast } from '@/hooks/use-toast';

export const useSupabaseRecordings = () => {
    const [recordings, setRecordings] = useState<Recording[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { toast } = useToast();

    const fetchRecordings = useCallback(async () => {
        try {
            setIsLoading(true);
            const { data, error } = await supabase
                .from('recordings')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            if (data) {
                const mappedRecordings: Recording[] = await Promise.all(
                    data.map(async (item: any) => {
                        const createdAt = new Date(item.created_at);
                        const isRecent = Date.now() - createdAt.getTime() < 7 * 24 * 60 * 60 * 1000;

                        if (isRecent) {
                            const fileName = item.audio_url?.split('/').pop();
                            if (fileName) {
                                const { data: blobData } = await supabase.storage
                                    .from('recordings')
                                    .download(fileName);

                                return {
                                    id: item.id,
                                    name: item.name,
                                    blob: blobData || item.audio_url,
                                    duration: item.duration,
                                    timestamp: createdAt,
                                    transcript: item.transcript,
                                    audioUrl: item.audio_url
                                };
                            }
                        }

                        return {
                            id: item.id,
                            name: item.name,
                            blob: item.audio_url,
                            duration: item.duration,
                            timestamp: createdAt,
                            transcript: item.transcript,
                            audioUrl: item.audio_url
                        };
                    })
                );

                setRecordings(mappedRecordings);
            }
        } catch (error) {
            console.error('Error fetching recordings:', error);
            toast({ title: 'Error', description: 'Failed to load recordings.', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    }, [toast]);

    const saveRecording = async (recording: Recording) => {
        try {
            // 1. Upload to Storage
            const fileName = `${Date.now()}_${recording.name.replace(/\s+/g, '_')}.webm`;
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('recordings')
                .upload(fileName, recording.blob);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('recordings')
                .getPublicUrl(fileName);

            // 2. Insert into DB
            const { data: insertData, error: insertError } = await supabase
                .from('recordings')
                .insert({
                    name: recording.name,
                    duration: recording.duration,
                    transcript: recording.transcript,
                    audio_url: publicUrl,
                    created_at: recording.timestamp.toISOString()
                })
                .select()
                .single();

            if (insertError) throw insertError;

            // Update local state with the simpler invalidation or optimistically
            const savedRecording = {
                ...recording,
                id: insertData.id,
                audioUrl: publicUrl
            };

            setRecordings(prev => [savedRecording, ...prev]);
            return savedRecording;

        } catch (error) {
            console.error('Error saving recording:', error);
            throw error;
        }
    };

    const updateRecording = async (id: string, updates: Partial<Recording>) => {
        try {
            // Update in DB
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dbUpdates: any = {};
            if (updates.name) dbUpdates.name = updates.name;
            if (updates.transcript) dbUpdates.transcript = updates.transcript;

            const { error: dbError } = await supabase
                .from('recordings')
                .update(dbUpdates)
                .eq('id', id);

            if (dbError) throw dbError;

            // Update in local state
            setRecordings(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));

        } catch (error) {
            console.error('Error updating recording:', error);
            toast({ title: 'Error', description: 'Failed to update recording.', variant: 'destructive' });
            throw error;
        }
    };

    const deleteRecording = async (id: string, audioUrl?: string) => {
        try {
            // Delete from DB
            const { error: dbError } = await supabase
                .from('recordings')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            // Delete from storage if we have the path (optional cleanup)
            // Parsing path from URL is tricky without more logic, skipping for "Level 2b".

            setRecordings(prev => prev.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting recording:', error);
            toast({ title: 'Error', description: 'Failed to delete recording.', variant: 'destructive' });
        }
    };

    // Initial fetch
    useEffect(() => {
        // Only fetch if configured
        if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
            fetchRecordings();
        }
    }, [fetchRecordings]);

    return {
        recordings,
        setRecordings, // Kept for compatibility, but prefer specific methods
        saveRecording,
        updateRecording,
        deleteRecording,
        isLoading
    };
};
