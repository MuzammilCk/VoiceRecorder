# Voice Recorder - Transcription Guide

## Overview

This voice recorder application now includes comprehensive transcription capabilities with multiple options for converting speech to text. The transcription system supports both real-time and post-processing transcription methods.

## Features

### 🎙️ Real-time Transcription
- Live speech-to-text conversion during recording
- Uses browser's built-in Web Speech API
- Supports multiple languages
- Shows interim and final results

### 🤖 AI-Powered Transcription
- Integration with OpenAI's Whisper API
- High-accuracy transcription for post-processing
- Better handling of accents and background noise
- Supports 99+ languages

### 📝 Manual Transcription
- Transcribe existing recordings
- Choose between browser or Whisper methods
- Batch transcription capabilities
- Error handling and retry options

## Getting Started

### Browser-Based Transcription (Free)

1. **Enable Microphone Access**: Allow microphone permissions when prompted
2. **Select Language**: Choose your preferred language from the dropdown
3. **Start Recording**: Click the microphone button to begin
4. **View Live Transcript**: See real-time transcription in the transcript panel
5. **Stop Recording**: Click the stop button to save with transcript

**Supported Browsers:**
- Chrome (recommended)
- Edge
- Safari
- Firefox (limited support)

### Whisper API Transcription (Premium)

1. **Get API Key**: 
   - Visit [OpenAI Platform](https://platform.openai.com/api-keys)
   - Create an account and generate an API key
   - Copy your API key (starts with `sk-`)

2. **Configure Settings**:
   - Click the Settings button in the voice recorder
   - Toggle "OpenAI Whisper" to enabled
   - Paste your API key in the provided field
   - Test the connection

3. **Record and Transcribe**:
   - Start recording as usual
   - The app will use Whisper for post-processing transcription
   - Higher accuracy, especially for longer recordings

## Language Support

### Browser Speech Recognition
- English (US, UK)
- Spanish (Spain, Mexico)
- French, German, Italian
- Portuguese (Brazil, Portugal)
- Russian, Japanese, Korean
- Chinese (Simplified, Traditional)
- Arabic, Hindi, Dutch
- And many more...

### Whisper API
- Supports 99+ languages
- Automatic language detection
- Better accuracy for non-English languages
- Handles accents and dialects better

## Usage Tips

### For Better Transcription Results:

1. **Audio Quality**:
   - Use a good quality microphone
   - Minimize background noise
   - Speak clearly and at moderate pace
   - Maintain consistent distance from microphone

2. **Language Selection**:
   - Choose the correct language for your content
   - For mixed-language content, use the primary language
   - Whisper can handle some language mixing automatically

3. **Recording Environment**:
   - Record in a quiet environment
   - Avoid echo and reverberation
   - Use headphones to prevent feedback

4. **Browser Recommendations**:
   - Chrome provides the best browser-based transcription
   - Ensure you have a stable internet connection
   - Keep your browser updated

## Troubleshooting

### Common Issues

**"Speech recognition not supported"**
- Use Chrome, Edge, or Safari
- Ensure microphone permissions are granted
- Check if your browser is updated

**"Transcription failed"**
- Check your internet connection
- Verify microphone is working
- Try speaking louder or closer to microphone
- For Whisper: verify API key is correct

**"No transcript available"**
- Recording might be too short
- Audio quality might be poor
- Try using Whisper for better results

**Whisper API Errors**:
- Verify API key is valid and has credits
- Check if the audio file is in a supported format
- Ensure the file size is within limits (25MB max)

### Error Messages

- **"Speech recognition error: no-speech"**: No speech detected, try speaking louder
- **"Speech recognition error: audio-capture"**: Microphone access issue
- **"Speech recognition error: network"**: Internet connection problem
- **"Whisper API error: invalid_api_key"**: Check your OpenAI API key

## API Costs

### Whisper API Pricing (as of 2024)
- $0.006 per minute of audio
- First 3 hours free for new users
- Pay-as-you-go pricing
- No monthly commitments

### Browser Speech Recognition
- Completely free
- No API keys required
- Limited by browser capabilities

## Technical Details

### Audio Formats
- **Recording**: WebM with Opus codec
- **Whisper Input**: Automatically converted to supported format
- **Quality**: 44.1kHz sample rate, stereo

### Privacy & Security
- **Browser Transcription**: Processed locally and by browser
- **Whisper API**: Audio sent to OpenAI's servers
- **API Keys**: Stored locally in browser, never sent to our servers
- **Recordings**: Stored locally in browser

### Performance
- **Real-time**: Minimal latency, good for live transcription
- **Whisper**: Higher accuracy, better for final transcripts
- **File Size**: WebM format provides good compression

## Advanced Features

### Batch Transcription
- Transcribe multiple recordings at once
- Available in the "My Recordings" section
- Choose transcription method per recording

### Transcript Management
- View all transcripts in the "Transcripts" section
- Search through transcript content
- Export transcripts as text files

### Integration
- Transcripts are automatically saved with recordings
- Available across all app sections
- Searchable and filterable

## Support

If you encounter issues:

1. Check this guide for common solutions
2. Verify your browser and microphone setup
3. Test with a short, clear recording first
4. For Whisper issues, check your API key and credits

## Future Enhancements

Planned features:
- Speaker identification
- Timestamp alignment
- Export to various formats
- Cloud storage integration
- Advanced editing capabilities

---

**Note**: This transcription system is designed for educational and personal use. For commercial applications, ensure compliance with relevant terms of service and privacy regulations.
