import React, { useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import { VoiceRecorder } from "@/components/VoiceRecorder";
import { AIInsights } from "@/components/AIInsights";
import { SearchDiscovery } from "@/components/SearchDiscovery";
import { Analytics } from "@/components/Analytics";
import { AILab } from "@/components/AILab";
import NotFound from "./pages/NotFound";
import { Card } from "@/components/ui/card";
import { Zap } from "lucide-react";
import MyRecordings from './components/MyRecordings';
import SharedWithMe from './components/SharedWithMe';
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

const ComingSoon = ({ title }: { title: string }) => (
    <div className="flex items-center justify-center h-full">
        <Card className="glass p-12 text-center">
            <div className="space-y-4">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                    <Zap className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-semibold">{title}</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    This feature is currently under development and will be available soon.
                </p>
            </div>
        </Card>
    </div>
);

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
                    <Route path="/insights" element={<AIInsights />} />
                    <Route path="/search" element={<SearchDiscovery />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/recordings" element={<MyRecordings recordings={recordings} setRecordings={setRecordings} />} />
                    <Route path="/shared" element={<SharedWithMe />} />
                    <Route path="/transcripts" element={<Transcripts recordings={recordings} />} />
                    <Route path="/lab" element={<AILab />} />
                    <Route path="/collaborate" element={<ComingSoon title="Collaboration" />} />
                    <Route path="/settings" element={<ComingSoon title="Settings" />} />
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