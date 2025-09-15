# Voice Recorder Transcription Guide

This guide explains how to set up and use the transcription features in the Voice Recorder application.

## Available Transcription Methods

### 1. Browser Speech Recognition (Free)
- Uses the built-in Web Speech API
- Works offline
- Limited accuracy
- May not work in all browsers

### 2. AssemblyAI API (Premium)
- High accuracy transcription with advanced features
- Requires AssemblyAI API key
- Costs per usage
- Supports speaker labels, sentiment analysis, and auto highlights

### 3. OpenAI Whisper API (Premium)
- High accuracy transcription
- Requires OpenAI API key
- Costs per usage
- Works with all audio formats

## Setup Instructions

### Browser Speech Recognition
No setup required - works out of the box in supported browsers.

### AssemblyAI API Setup
1. **Get API Key**: Sign up at [AssemblyAI](https://www.assemblyai.com/) and get your API key
2. **Create .env file**: Create a `.env` file in the project root directory
3. **Add API Key**: Add this line to your `.env` file:
   ```
   VITE_ASSEMBLYAI_API_KEY=your_actual_api_key_here
   ```
4. **Restart Server**: Restart your development server (`npm run dev`)
5. **Test**: Try recording and check browser console for API status

### OpenAI Whisper API
1. Get an API key from [OpenAI Platform](https://platform.openai.com/api-keys)
2. Open the Settings tab in the Voice Recorder
3. Enter your API key in the "OpenAI API Key" field
4. Toggle "Use Whisper API" to enable

## Usage

1. **Record Audio**: Click the record button to start recording
2. **Stop Recording**: Click stop when finished
3. **Automatic Transcription**: The app will automatically transcribe using your selected method
4. **View Results**: Transcription appears in the text area below the controls

## Troubleshooting

### AssemblyAI Issues
- **"AssemblyAI API not configured"**: 
  - Check if `.env` file exists in project root
  - Verify `VITE_ASSEMBLYAI_API_KEY` is set correctly
  - Restart development server after adding API key
- **API key errors**: 
  - Verify your AssemblyAI API key is correct and active
  - Check your AssemblyAI account has sufficient credits
- **Network errors**: 
  - Check browser console for detailed error messages
  - Verify internet connection
  - Check if Vite proxy is working (should see `/assemblyai/*` requests)
- **Transcription timeout**: Normal for very long audio files (>5 minutes)

### Browser Speech Recognition Issues
- **No transcription**: Check if your browser supports Web Speech API
- **Poor accuracy**: Try speaking more clearly or use AssemblyAI/Whisper API instead
- **Not working**: Ensure microphone permissions are granted

### Whisper API Issues
- **API key errors**: Verify your OpenAI API key is correct and has credits
- **Network errors**: Check your internet connection
- **Slow transcription**: This is normal for longer audio files

## Debugging Steps

### For AssemblyAI Issues:
1. **Check Console Logs**: Open browser DevTools → Console tab
2. **Look for API Key Status**: Should see `[AssemblyAI] API key detected (length: XX)`
3. **Monitor Network Requests**: Check Network tab for `/assemblyai/*` requests
4. **Verify Environment**: 
   ```bash
   # Check if .env file exists
   ls -la .env
   
   # Restart development server
   npm run dev
   ```
5. **Test API Key**: The console will show detailed error messages if API calls fail

### Environment File Template:
Create `.env` file with:
```env
# AssemblyAI API Configuration
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_api_key_here

# Other API keys (optional)
VITE_HUME_API_KEY=your_hume_api_key_here
VITE_ACRCLOUD_ACCESS_KEY=your_acrcloud_key_here
VITE_ACRCLOUD_ACCESS_SECRET=your_acrcloud_secret_here
```

## Tips for Better Transcription

1. **Clear Audio**: Speak clearly and avoid background noise
2. **Good Microphone**: Use a quality microphone for better results
3. **Quiet Environment**: Record in a quiet space
4. **Proper Distance**: Stay 6-12 inches from the microphone
5. **Natural Speech**: Speak at a normal pace, don't rush

## API Costs

- **Browser Speech Recognition**: Free
- **AssemblyAI**: ~$0.00037 per 15-second chunk (~$0.0015 per minute)
- **OpenAI Whisper**: ~$0.006 per minute of audio

Choose the method that best fits your needs and budget.

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
