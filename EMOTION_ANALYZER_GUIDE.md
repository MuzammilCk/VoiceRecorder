# Emotion Analyzer Guide

## Overview

The Emotion Analyzer is an AI-powered feature that analyzes the emotional content of voice recordings. It can detect emotions like happiness, sadness, anger, fear, excitement, and more from audio files.

## Features

### 🎯 **Dual Analysis Methods**
- **Local Analysis**: Uses advanced audio signal processing to extract features like pitch, energy, spectral centroid, and zero-crossing rate
- **Hume AI Integration**: Optional premium AI service for enhanced emotion recognition accuracy

### 📁 **File Support**
- **Upload External Files**: Support for WAV, MP3, WebM, OGG, M4A formats (up to 50MB)
- **Analyze Recordings**: Direct analysis of recordings made in the Voice Studio
- **Batch Processing**: Analyze multiple recordings from your library

### 📊 **Comprehensive Results**
- **Emotion Scores**: Confidence levels for detected emotions
- **Dominant Emotion**: Primary emotional state identified
- **Audio Features**: Technical analysis including pitch, energy, and voice characteristics
- **Visual Feedback**: Progress bars, emotion icons, and color-coded results

## How to Use

### 1. Access the Emotion Analyzer
- Navigate to **"Emotion Analyzer"** in the sidebar
- The analyzer has three main tabs: Upload Audio, My Recordings, and Settings

### 2. Upload External Audio Files
1. Click the **"Upload Audio"** tab
2. Click **"Choose Audio File"** button
3. Select an audio file from your device
4. Click **"Analyze Emotions"** to start the analysis

### 3. Analyze Your Recordings
1. Click the **"My Recordings"** tab
2. Browse your existing voice recordings
3. Click the brain icon next to any recording to analyze it
4. View the detailed emotion analysis results

### 4. Configure Settings
1. Click the **"Settings"** tab
2. Toggle **"Use Hume AI"** for enhanced analysis (requires API key)
3. Enter your Hume AI API key if using premium analysis
4. Review analysis method descriptions

## Understanding Results

### Emotion Categories
- **😊 Happiness/Joy**: High energy, elevated pitch, positive vocal patterns
- **😢 Sadness**: Low energy, reduced pitch, subdued vocal characteristics
- **😠 Anger**: High energy, variable pitch, vocal tension indicators
- **😰 Fear/Anxiety**: Elevated pitch, brightness, nervous vocal patterns
- **😌 Calm/Neutral**: Balanced audio features, steady vocal patterns
- **⚡ Excitement**: Very high energy, elevated pitch, dynamic vocal patterns

### Confidence Scores
- **90-100%**: Very high confidence, clear emotional indicators
- **70-89%**: High confidence, strong emotional patterns
- **50-69%**: Moderate confidence, some emotional indicators
- **30-49%**: Low confidence, weak emotional signals
- **Below 30%**: Very low confidence, unclear emotional state

### Audio Features Explained
- **Pitch**: Fundamental frequency of the voice (measured in Hz)
- **Energy**: Overall vocal intensity and volume level
- **Brightness**: Spectral centroid indicating voice clarity and sharpness
- **Voice Activity**: Zero-crossing rate showing vocal dynamics and articulation

## API Integration

### Hume AI Setup
1. Visit [hume.ai](https://hume.ai) and create an account
2. Generate an API key from your dashboard
3. Enter the API key in the Settings tab
4. Enable "Use Hume AI" toggle for enhanced analysis

### Local Analysis
- No API key required
- Uses advanced signal processing algorithms
- Provides immediate results
- Good for basic emotion detection and privacy-conscious users

## Technical Details

### Supported Audio Formats
- **WAV**: Uncompressed, highest quality
- **MP3**: Compressed, widely compatible
- **WebM**: Modern web format, good compression
- **OGG**: Open-source format, good quality
- **M4A**: Apple format, good compression

### File Limitations
- Maximum file size: 50MB
- Recommended duration: 10 seconds to 10 minutes
- Sample rate: 16kHz or higher recommended
- Mono or stereo channels supported

### Analysis Algorithms

#### Local Analysis Features
1. **Pitch Detection**: Autocorrelation-based fundamental frequency estimation
2. **Energy Calculation**: RMS energy computation for vocal intensity
3. **Spectral Analysis**: FFT-based spectral centroid for voice brightness
4. **Temporal Features**: Zero-crossing rate for vocal dynamics
5. **Emotion Inference**: Heuristic rules based on acoustic features

#### Emotion Mapping
- High pitch + High energy → Happiness/Excitement
- Low pitch + Low energy → Sadness
- High energy + High zero-crossing → Anger
- High pitch + High brightness → Fear/Anxiety
- Balanced features → Calm/Neutral

## Privacy and Security

### Data Handling
- Audio files are processed locally when using local analysis
- Hume AI analysis sends audio to external servers (encrypted)
- API keys are stored locally in your browser
- No audio data is permanently stored on external servers

### Best Practices
- Use local analysis for sensitive recordings
- Only use Hume AI for non-confidential content
- Regularly update your API keys
- Clear browser data to remove stored API keys

## Troubleshooting

### Common Issues

#### "Analysis Failed" Error
- **Cause**: Unsupported file format or corrupted audio
- **Solution**: Convert to supported format (WAV, MP3, WebM, OGG, M4A)

#### "File Too Large" Error
- **Cause**: Audio file exceeds 50MB limit
- **Solution**: Compress or trim the audio file

#### "API Key Required" Error
- **Cause**: Hume AI enabled but no API key provided
- **Solution**: Enter valid API key in Settings or disable Hume AI

#### Low Confidence Scores
- **Cause**: Poor audio quality, background noise, or unclear speech
- **Solution**: Use higher quality recordings with clear speech

#### "No Emotions Detected"
- **Cause**: Very neutral speech or technical audio issues
- **Solution**: Try different audio or check file quality

### Performance Tips
- Use high-quality audio recordings for better results
- Ensure clear speech without background noise
- Keep recordings between 10 seconds to 5 minutes for optimal analysis
- Use a good microphone for voice recordings

## Integration with Other Features

### Voice Studio Integration
- Recordings made in Voice Studio are automatically available for emotion analysis
- Emotion results can be stored with recording metadata
- Cross-reference emotions with transcription content

### Future Enhancements
- Real-time emotion analysis during recording
- Emotion trends over time
- Integration with transcription for sentiment analysis
- Export emotion analysis reports

## Support and Feedback

For technical support or feature requests:
1. Check this guide for common solutions
2. Verify your audio file format and quality
3. Test with different recordings to isolate issues
4. Ensure stable internet connection for Hume AI analysis

---

*This feature is part of the Voice Recorder application's AI-powered voice intelligence suite.*
