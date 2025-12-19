import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { AppSidebar } from "@/components/AppSidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

export const metadata: Metadata = {
    title: "Voice Recorder",
    description: "Professional Voice Intelligence",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased font-sans">
                <Providers>
                    <div className="flex min-h-screen w-full bg-background">
                        <AppSidebar />
                        <div className="flex-1 flex flex-col">
                            <header className="h-14 flex items-center border-b border-border/50 px-6 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
                                <SidebarTrigger className="mr-4" />
                                <div className="flex items-center gap-3">
                                    <div className="w-6 h-6 bg-gradient-to-r from-primary to-primary-glow rounded flex items-center justify-center">
                                        <div className="w-3 h-3 bg-primary-foreground rounded-full" />
                                    </div>
                                    <span className="font-semibold text-lg">Voice recorder</span>
                                </div>
                            </header>
                            <main className="flex-1 p-6 overflow-auto">
                                {children}
                            </main>
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
