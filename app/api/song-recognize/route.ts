import { NextResponse } from 'next/server';
import crypto from 'crypto';

const ACRCLOUD_HOST = 'identify-us-west-2.acrcloud.com';
const ACCESS_KEY = process.env.ACRCLOUD_ACCESS_KEY || process.env.VITE_ACRCLOUD_ACCESS_KEY;
const ACCESS_SECRET = process.env.ACRCLOUD_ACCESS_SECRET || process.env.VITE_ACRCLOUD_ACCESS_SECRET;

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const audioFile = formData.get('audio') as Blob;

        if (!audioFile) {
            return NextResponse.json({ error: 'No audio file' }, { status: 400 });
        }

        if (!ACCESS_KEY || !ACCESS_SECRET) {
            console.error('ACRCloud credentials missing');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Generate signature
        const timestamp = Math.floor(Date.now() / 1000);
        const stringToSign = `POST\n/v1/identify\n${ACCESS_KEY}\naudio\n1\n${timestamp}`;

        // Use Buffer for HMAC to ensure correct signature generation for binary data/API requirements
        const signature = crypto
            .createHmac('sha1', ACCESS_SECRET)
            .update(Buffer.from(stringToSign, 'utf-8'))
            .digest()
            .toString('base64');

        // Prepare form data for ACRCloud
        const acrFormData = new FormData();
        acrFormData.append('sample', audioFile, 'recording.webm');
        acrFormData.append('sample_bytes', audioFile.size.toString());
        acrFormData.append('access_key', ACCESS_KEY);
        acrFormData.append('data_type', 'audio');
        acrFormData.append('signature_version', '1');
        acrFormData.append('signature', signature);
        acrFormData.append('timestamp', timestamp.toString());

        console.log('[SongRecognize] Sending request to ACRCloud...');

        // Call ACRCloud API
        const response = await fetch(`https://${ACRCLOUD_HOST}/v1/identify`, {
            method: 'POST',
            body: acrFormData
        });

        const result = await response.json();

        if (result.status?.code === 0 && result.metadata?.music?.[0]) {
            const song = result.metadata.music[0];
            console.log('[SongRecognize] Match found:', song.title);

            return NextResponse.json({
                success: true,
                match: {
                    title: song.title,
                    artists: song.artists?.map((a: any) => ({ name: a.name })) || [],
                    album: { name: song.album?.name || 'Unknown Album' },
                    release_date: song.release_date || 'Unknown Date',
                    confidence: (song.score || 0) / 100,
                    external_urls: {
                        spotify: song.external_metadata?.spotify?.track?.id
                            ? `https://open.spotify.com/track/${song.external_metadata.spotify.track.id}`
                            : undefined,
                        youtube: song.external_metadata?.youtube?.vid
                            ? song.external_metadata.youtube.vid
                            : undefined
                    }
                }
            });
        } else {
            console.log('[SongRecognize] No match or error:', result.status?.msg || 'Unknown');
        }

        return NextResponse.json({
            success: false,
            error: result.status?.msg || 'No matching song found'
        });

    } catch (error) {
        console.error('[SongRecognize] Error:', error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
