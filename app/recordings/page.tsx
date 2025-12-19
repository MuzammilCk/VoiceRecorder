"use client";

import MyRecordings from "@/components/MyRecordings";
import { useRecordings } from "@/components/Providers";

export default function MyRecordingsPage() {
    const { recordings, setRecordings } = useRecordings();
    return <MyRecordings recordings={recordings} setRecordings={setRecordings} />;
}
