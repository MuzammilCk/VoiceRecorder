"use client";

import Transcripts from "@/components/Transcripts";
import { useRecordings } from "@/components/Providers";

export default function TranscriptsPage() {
    const { recordings } = useRecordings();
    return <Transcripts recordings={recordings} />;
}
