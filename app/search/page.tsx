"use client";

import React from 'react';
import { useChat } from 'ai/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Search, Bot, User } from 'lucide-react';
import { useRecordings } from '@/components/Providers';

export default function SearchPage() {
    const { recordings } = useRecordings();
    const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
        api: '/api/rag/chat',
    });

    const messagesEndRef = React.useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const hasEmbeddings = recordings.length > 0; // Simple check, in reality we'd check if they are indexed

    return (
        <div className="container max-w-4xl mx-auto py-8 space-y-6">
            <Card className="glass p-8 border-border/50 min-h-[600px] flex flex-col">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                        <Search className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold">Search & Chat</h1>
                        <p className="text-muted-foreground">Ask questions across your entire library</p>
                    </div>
                </div>

                <ScrollArea className="flex-1 pr-4 mb-4 h-[400px]">
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground opacity-50 space-y-4">
                            <Bot className="w-12 h-12" />
                            <p>Ask anything! Examples:</p>
                            <ul className="text-sm space-y-2">
                                <li>"What did I say about the marketing plan?"</li>
                                <li>"Summarize my thoughts on the new project."</li>
                                <li>"When is the deadline I mentioned?"</li>
                            </ul>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {messages.map((m) => (
                                <div
                                    key={m.id}
                                    className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'
                                        }`}
                                >
                                    <div
                                        className={`flex items-start gap-2 max-w-[80%] ${m.role === 'user' ? 'flex-row-reverse' : ''
                                            }`}
                                    >
                                        <div
                                            className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-green-600 text-white'
                                                }`}
                                        >
                                            {m.role === 'user' ? (
                                                <User className="w-4 h-4" />
                                            ) : (
                                                <Bot className="w-4 h-4" />
                                            )}
                                        </div>
                                        <div
                                            className={`p-3 rounded-lg text-sm ${m.role === 'user'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-muted text-foreground'
                                                }`}
                                        >
                                            {m.content}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                    )}
                </ScrollArea>

                <form onSubmit={handleSubmit} className="flex gap-2 mt-auto">
                    <Input
                        value={input}
                        onChange={handleInputChange}
                        placeholder="Search your voice notes..."
                        className="flex-1"
                        disabled={isLoading}
                    />
                    <Button type="submit" disabled={isLoading || !input.trim()}>
                        {isLoading ? (
                            <span className="animate-spin mr-2">⏳</span>
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Ask
                    </Button>
                </form>
            </Card>
        </div>
    );
}
