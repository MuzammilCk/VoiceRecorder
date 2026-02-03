"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { Recording } from '@/types';
import { useSupabaseRecordings } from "@/hooks/useSupabaseRecordings";

interface RecordingsContextType {
    recordings: Recording[];
    setRecordings: React.Dispatch<React.SetStateAction<Recording[]>>;
    saveRecording: (recording: Recording) => Promise<Recording>; // Add save method
    updateRecording: (id: string, updates: Partial<Recording>) => Promise<void>; // Add update method
    deleteRecording: (id: string) => Promise<void>; // Add delete method
    isLoading: boolean;
}

const RecordingsContext = createContext<RecordingsContextType | undefined>(undefined);

export const useRecordings = () => {
    const context = useContext(RecordingsContext);
    if (!context) {
        throw new Error("useRecordings must be used within a RecordingsProvider");
    }
    return context;
};

export function Providers({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient());
    // Use Supabase hook instead of local state
    const { recordings, setRecordings, saveRecording, updateRecording, deleteRecording, isLoading } = useSupabaseRecordings();

    return (
        <QueryClientProvider client={queryClient}>
            <TooltipProvider>
                <RecordingsContext.Provider value={{ recordings, setRecordings, saveRecording, updateRecording, deleteRecording, isLoading }}>
                    <SidebarProvider>
                        {children}
                        <Toaster />
                        <Sonner />
                    </SidebarProvider>
                </RecordingsContext.Provider>
            </TooltipProvider>
        </QueryClientProvider>
    );
}
