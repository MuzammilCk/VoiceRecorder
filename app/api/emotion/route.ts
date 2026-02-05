import { NextResponse } from 'next/server';

const HUME_API_KEY = process.env.HUME_API_KEY!;
const HUME_WS_URL = 'wss://api.hume.ai/v0/stream/models';

export async function POST(request: Request) {
    if (!HUME_API_KEY) {
        console.error('HUME_API_KEY is not set');
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    try {
        const formData = await request.formData();
        const audioFile = formData.get('file') as Blob;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file provided' }, { status: 400 });
        }

        // Convert Blob to ArrayBuffer then Buffer
        const arrayBuffer = await audioFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const audioBase64 = buffer.toString('base64');

        // Perform analysis via Hume WebSocket (Streaming API used for single-file batch-like processing)
        const result = await analyzeAudioWithHume(audioBase64);

        return NextResponse.json(result);

    } catch (error) {
        console.error('[EmotionAnalysis] Error:', error);
        return NextResponse.json({
            error: error instanceof Error ? error.message : 'Analysis failed',
            details: String(error)
        }, { status: 500 });
    }
}

async function analyzeAudioWithHume(audioBase64: string): Promise<any> {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(`${HUME_WS_URL}?api_key=${HUME_API_KEY}`);

        let aggregatedEmotions: any[] = [];
        let hasError = false;

        // Timeout to close socket if idle for too long (e.g. 10s after last message)
        let idleTimeout: NodeJS.Timeout;
        const resetIdleTimeout = () => {
            if (idleTimeout) clearTimeout(idleTimeout);
            idleTimeout = setTimeout(() => {
                console.log('[Hume] Socket idle, closing...');
                if (socket.readyState === WebSocket.OPEN) socket.close();
            }, 10000); // 10 seconds idle timeout
        };

        socket.onopen = async () => {
            console.log('[Hume] Connected to WebSocket');
            resetIdleTimeout();

            // 1. Send Configuration
            const config = {
                models: {
                    prosody: {}
                }
            };
            socket.send(JSON.stringify(config));

            // 2. Stream Audio in Chunks
            // Convert base64 back to buffer
            const audioBuffer = Buffer.from(audioBase64, 'base64');
            const CHUNK_SIZE = 16 * 1024; // 16KB chunks

            for (let i = 0; i < audioBuffer.length; i += CHUNK_SIZE) {
                if (socket.readyState !== WebSocket.OPEN) break;

                const chunk = audioBuffer.subarray(i, i + CHUNK_SIZE);
                socket.send(chunk);

                // Optional: very small delay to prevent flooding?
                // await new Promise(r => setTimeout(r, 1));
            }

            console.log(`[Hume] Sent ${audioBuffer.length} bytes of audio data`);
            // We keep the socket open to receive results.
            // The idle timeout will close it when no more predictions come in.
        };

        socket.onmessage = (event) => {
            resetIdleTimeout();
            try {
                const response = JSON.parse(event.data.toString());

                // Check for errors
                if (response.error) {
                    console.error('[Hume] API Error:', response.error);
                    hasError = true;
                    // We don't close immediately, some valid results might have arrived or might define the error better
                }

                // Check for prosody predictions
                if (response.prosody && response.prosody.predictions) {
                    aggregatedEmotions.push(...response.prosody.predictions);
                }
            } catch (e) {
                console.error('[Hume] Parse error:', e);
            }
        };

        socket.onerror = (error) => {
            console.error('[Hume] WebSocket Error:', error);
            if (!aggregatedEmotions.length) {
                hasError = true;
                reject(new Error('WebSocket connection failed'));
            }
        };

        socket.onclose = () => {
            console.log('[Hume] Connection closed');
            if (idleTimeout) clearTimeout(idleTimeout);

            if (!hasError && aggregatedEmotions.length > 0) {
                resolve(processAggregatedEmotions(aggregatedEmotions));
            } else if (hasError) {
                // If we have no data, reject.
                reject(new Error('Analysis failed or returned no data'));
            } else {
                if (aggregatedEmotions.length > 0) {
                    // Fallback: if we have data but maybe hit a minor error or just closed clean
                    resolve(processAggregatedEmotions(aggregatedEmotions));
                } else {
                    // Closed without results
                    resolve({
                        emotions: [],
                        dominantEmotion: 'neutral',
                        confidence: 0,
                        provider: 'hume',
                        error: 'No emotion data received from stream'
                    });
                }
            }
        };
    });
}

function processAggregatedEmotions(predictions: any[]) {
    // Flatten and Average emotions across all time segments
    const emotionMap = new Map<string, number>();
    let count = 0;

    predictions.forEach(p => {
        if (p.emotions) {
            p.emotions.forEach((e: any) => {
                const current = emotionMap.get(e.name) || 0;
                emotionMap.set(e.name, current + e.score);
            });
            count++;
        }
    });

    if (count === 0) return null;

    // Average scores (Note: average across FRAMES, not simple count)
    // Actually, 'count' is the number of prediction frames.
    // e.emotions is a list of scores for that frame.

    const averagedEmotions: any[] = [];
    emotionMap.forEach((totalScore, name) => {
        averagedEmotions.push({
            emotion: name,
            score: totalScore / count
        });
    });

    // Sort by score
    averagedEmotions.sort((a, b) => b.score - a.score);

    // Map to our app's structure
    const topEmotions = averagedEmotions.slice(0, 5).map(e => ({
        emotion: e.emotion,
        confidence: e.score,
        description: getDescriptionForEmotion(e.emotion)
    }));

    return {
        emotions: topEmotions,
        dominantEmotion: topEmotions[0]?.emotion || 'neutral',
        confidence: topEmotions[0]?.confidence || 0,
        provider: 'hume'
    };
}

function getDescriptionForEmotion(emotion: string): string {
    // Simple mapping for descriptions (can be expanded)
    const descriptions: { [key: string]: string } = {
        'joy': 'Happiness and delight',
        'sadness': 'Sorrow or melancholy',
        'anger': 'Frustration or hostility',
        'fear': 'Anxiety or apprehension',
        'neutral': 'Calm and balanced',
        'calmness': 'Peaceful and relaxed',
        'surprise': 'Unexpected astonishment',
        'amusement': 'Lighthearted and funny',
        'excitement': 'High energy and enthusiasm'
    };
    return descriptions[emotion] || `Detected ${emotion}`;
}
