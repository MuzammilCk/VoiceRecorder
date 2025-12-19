
"use client";

import React, { useEffect, useRef } from 'react';
import { useChat, Message } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Sparkles, Loader2, FileText, ListTodo } from 'lucide-react';
import { Recording } from '@/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface AIInsightsProps {
  recording: Recording;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ recording }) => {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setInput, append } = useChat({
    api: '/api/chat',
    body: {
      transcript: recording.transcript || "(No transcript available)"
    }
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleQuickAction = (action: string) => {
    let prompt = "";
    switch (action) {
      case 'summarize':
        prompt = "Please summarize this recording in 3-5 bullet points.";
        break;
      case 'action_items':
        prompt = "Extract any action items, to-dos, or follow-ups from this recording.";
        break;
      case 'sentiment':
        prompt = "Analyze the sentiment and tone of the speaker. Be specific.";
        break;
    }

    if (prompt) {
      append({ role: 'user', content: prompt });
    }
  };

  if (!recording.transcript) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        <p>No transcript available for AI analysis.</p>
        <p className="text-sm mt-2">Please transcribe the recording first.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-[600px] border-border/50 glass">
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">{recording.name}</p>
          </div>
        </div>
        <Badge variant="outline" className="text-xs">
          GPT-4o
        </Badge>
      </div>

      {/* Quick Actions */}
      {messages.length === 0 && (
        <div className="p-4 grid grid-cols-2 gap-2 border-b border-border/50 bg-secondary/20">
          <Button variant="outline" size="sm" className="justify-start" onClick={() => handleQuickAction('summarize')}>
            <FileText className="w-4 h-4 mr-2 text-blue-500" />
            Summarize
          </Button>
          <Button variant="outline" size="sm" className="justify-start" onClick={() => handleQuickAction('action_items')}>
            <ListTodo className="w-4 h-4 mr-2 text-green-500" />
            Action Items
          </Button>
        </div>
      )}

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Ask me anything about this recording!</p>
            </div>
          )}

          {messages.map((m: Message) => (
            <div
              key={m.id}
              className={cn(
                "flex gap-3 max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                m.role === 'user' ? "bg-primary text-primary-foreground" : "bg-muted"
              )}>
                {m.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={cn(
                "p-3 rounded-lg text-sm",
                m.role === 'user'
                  ? "bg-primary text-primary-foreground rounded-tr-none"
                  : "bg-muted text-foreground rounded-tl-none whitespace-pre-wrap"
              )}>
                {m.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm ml-12">
              <Loader2 className="w-3 h-3 animate-spin" />
              Thinking...
            </div>
          )}
          {/* Dummy div for auto-scrolling is handled by ScrollArea/ref trick often, 
                        but standard div ref is safer for raw scrolling */}
          <div ref={scrollRef as any} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border/50">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question..."
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            <Send className="w-4 h-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </Card>
  );
};