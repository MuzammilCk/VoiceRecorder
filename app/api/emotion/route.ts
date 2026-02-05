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

        socket.onopen = () => {
            console.log('[Hume] Connected to WebSocket');

            // 1. Send Configuration
            const config = {
                models: {
                    prosody: {}
                }
            };
            socket.send(JSON.stringify(config));

            // 2. Send Audio Data (Blob/Binary)
            // Hume supports sending the blob directly or base64. 
            // For WebSocket in Node, sending a Buffer is usually supported but depends on implementation.
            // Let's send the binary data as a Blob or ArrayBuffer if possible.
            // However, the 'ws' client in browser supports Blob. Native Node WebSocket supports Buffer/ArrayBuffer.
            // But wait, we have the audioBase64 string. 
            // Hume Protocol: Binary messages are treated as audio input. 
            // JSON messages are treated as config/input with `data` field.

            // Let's send a JSON payload with base64 encoded audio for simplicity and compatibility
            // Actually, typical usage: Send config, then send binary chunks.
            const binaryMessage = Buffer.from(audioBase64, 'base64');
            socket.send(binaryMessage);

            // 3. Close the stream to indicate end of audio? 
            // Hume doesn't strictly require a "close" packet for streaming if we just wait for results.
            // But usually you keep it open. 
            // Issue: How do we know when it's done? 
            // Streaming API returns predictions as it processes.
            // For a single file, we might get multiple frames. 
            // We should wait for a bit or until we get at least one result?
            // Actually, Hume Streaming doesn't explicitly send "Done". 
            // We might need to listen for messages and close after a silence or timeout?

            // Better approach for "File": Send the whole file, wait for results, then close after a timeout if no more results?
            // Or rely on the fact that we sent one big chunk.
            // Let's set a timeout to close if no messages received.
        };

        socket.onmessage = (event) => {
            try {
                const response = JSON.parse(event.data.toString());

                // Check for errors
                if (response.error) {
                    console.error('[Hume] API API Error:', response.error);
                    hasError = true;
                    socket.close();
                    reject(new Error(response.error));
                    return;
                }

                // Check for prosody predictions
                if (response.prosody && response.prosody.predictions) {
                    // Collect predictions
                    aggregatedEmotions.push(...response.prosody.predictions);
                }

                // If we have predictions, and since we sent one file, we might be done?
                // Depending on file size, we might get multiple chunks.
                // But typically for short files < 10s, it might be one or two.

            } catch (e) {
                console.error('[Hume] Parse error:', e);
            }
        };

        socket.onerror = (error) => {
            console.error('[Hume] WebSocket Error:', error);
            hasError = true;
            reject(new Error('WebSocket connection failed'));
        };

        socket.onclose = () => {
            console.log('[Hume] Connection closed');
            if (!hasError) {
                // Process aggregated results
                if (aggregatedEmotions.length > 0) {
                    resolve(processAggregatedEmotions(aggregatedEmotions));
                } else {
                    reject(new Error('No emotion data received'));
                }
            }
        };

        // Timeout/Safety Close: Close after 5 seconds of "processing" 
        // (This is a heuristic for this simplified implementation)
        setTimeout(() => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        }, 5000);
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
