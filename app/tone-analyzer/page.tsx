"use client";

import { ToneAnalyzer } from "@/components/ToneAnalyzer";
import { useRecordings } from "@/components/Providers";

export default function ToneAnalyzerPage() {
    const { recordings } = useRecordings();
    return <ToneAnalyzer recordings={recordings} />;
}
