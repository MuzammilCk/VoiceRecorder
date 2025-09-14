import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { SongSearch } from "@/components/SongSearch"; 
 
import NotFound from "./pages/NotFound";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import MyRecordings from './components/MyRecordings';
import Transcripts from './components/Transcripts';

// Define the Recording type to be shared
export interface Recording {
  id: string;
  name: string;
  blob: Blob;
  duration: number;
  timestamp: Date;
  transcript?: string;
}

const queryClient = new QueryClient();

const App = () => {
  const [recordings, setRecordings] = useState<Recording[]>([]);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SidebarProvider>
            <div className="flex min-h-screen w-full bg-background">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <header className="h-14 flex items-center border-b border-border/50 px-6 bg-card/50 backdrop-blur-sm">
                  <SidebarTrigger className="mr-4" />
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 bg-gradient-to-r from-primary to-primary-glow rounded flex items-center justify-center">
                      <div className="w-3 h-3 bg-primary-foreground rounded-full" />
                    </div>
                    <span className="font-semibold text-lg">Voice recorder</span>
                  </div>
                </header>
                <main className="flex-1 p-6 overflow-auto">
                  <Routes>
                    <Route path="/" element={<VoiceRecorder recordings={recordings} setRecordings={setRecordings} />} />
                    <Route path="/song-search" element={<SongSearch />} />
                    <Route path="/recordings" element={<MyRecordings recordings={recordings} setRecordings={setRecordings} />} />
                    <Route path="/transcripts" element={<Transcripts recordings={recordings} />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;