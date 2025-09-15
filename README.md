# Voice Recorder - Advanced Transcription Web App

A modern, professional voice recording application with comprehensive transcription capabilities, built for educational and professional use.

## 🎯 Project Overview

This is a sophisticated voice recorder web application that combines traditional audio recording with cutting-edge speech-to-text technology. The app features real-time transcription, AI-powered accuracy enhancement, and a beautiful, responsive user interface.

## ✨ Key Features

### 🎙️ **Advanced Voice Recording**
- High-quality audio recording with visual waveform
- Real-time audio level visualization
- Custom recording names and timestamps
- Multiple audio format support (WebM with Opus codec)

### 🗣️ **Dual Transcription System** ⭐ **MAIN FEATURE**
- **Real-time Transcription**: Live speech-to-text during recording using Web Speech API
- **AI-Powered Transcription**: OpenAI Whisper integration for 95%+ accuracy
- **Multi-language Support**: 25+ languages supported
- **Post-processing**: Transcribe existing recordings with different methods
- **Error Handling**: Robust error management and user feedback

### 🧠 **Emotion Analyzer** ⭐ **NEW FEATURE**
- **AI-Powered Emotion Detection**: Analyze emotional content of voice recordings
- **Dual Analysis Methods**: Local audio processing + optional Hume AI integration
- **File Upload Support**: Analyze external audio files (WAV, MP3, WebM, OGG, M4A)
- **Comprehensive Results**: Emotion scores, confidence levels, and audio features
- **Visual Feedback**: Emotion icons, progress bars, and detailed analysis reports

### 🎨 **Modern User Interface**
- Glassmorphism design with smooth animations
- Responsive layout for all devices
- Intuitive controls and settings panel
- Professional audio visualization
- Real-time status indicators


### 📊 **Data Management**
- Local storage of recordings and transcripts
- Search and filter capabilities
- Export functionality for recordings
- Recording history and analytics
- Batch transcription capabilities

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- Modern web browser (Chrome recommended for best transcription experience)

### Installation

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd VoiceRecorder

# Install dependencies
npm install

# Start development server
npm run dev
```

### Usage

1. **Open the application** in your browser (Chrome recommended)
2. **Allow microphone access** when prompted
3. **Configure transcription settings** (optional - click Settings button)
4. **Start recording** by clicking the microphone button
5. **View real-time transcription** as you speak
6. **Stop recording** to save with transcript
7. **Manage recordings** in the "My Recordings" section

## 🔧 Technical Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: Tailwind CSS, Radix UI components, shadcn/ui
- **Audio Processing**: Web Audio API, MediaRecorder API
- **Speech Recognition**: Web Speech API, OpenAI Whisper API
- **State Management**: React hooks, localStorage
- **Build Tools**: Vite, ESLint, PostCSS

## 📱 Browser Support

| Browser | Recording | Browser Transcription | Whisper API |
|---------|-----------|----------------------|-------------|
| Chrome  | ✅ Full   | ✅ Full              | ✅ Full     |
| Edge    | ✅ Full   | ✅ Full              | ✅ Full     |
| Safari  | ✅ Full   | ✅ Limited           | ✅ Full     |
| Firefox | ✅ Full   | ❌ Not Supported     | ✅ Full     |

## 🌍 Language Support

### Browser Speech Recognition
English (US/UK), Spanish, French, German, Italian, Portuguese, Russian, Japanese, Korean, Chinese, Arabic, Hindi, Dutch, Swedish, Norwegian, Danish, Finnish, Polish, Turkish, Hebrew, Thai, Vietnamese, and more.

### Whisper API
99+ languages with automatic language detection and superior accuracy.

## 💡 Use Cases

- **Educational**: Lecture recording, student notes, language learning
- **Professional**: Meeting transcription, client calls, presentations
- **Personal**: Voice notes, journaling, accessibility support
- **Business**: Interview recording, training sessions, documentation

## 🔐 Privacy & Security

- **Local Storage**: All recordings stored locally in browser
- **API Keys**: Stored locally, never sent to our servers
- **Whisper API**: Audio sent to OpenAI's secure servers only when using Whisper
- **No Tracking**: No user data collection or tracking

## 📖 Documentation

- [Transcription Guide](TRANSCRIPTION_GUIDE.md) - Comprehensive guide to transcription features
- [Emotion Analyzer Guide](EMOTION_ANALYZER_GUIDE.md) - Complete guide to voice emotion analysis
- [Demo Instructions](DEMO_INSTRUCTIONS.md) - Step-by-step demo script for presentations

## 🎓 Academic Value

This project demonstrates:
- **Web APIs Integration**: MediaRecorder, Web Speech API, Web Audio API
- **Modern JavaScript**: ES6+, TypeScript, async/await patterns
- **React Development**: Hooks, component architecture, state management
- **User Experience Design**: Responsive design, accessibility, error handling
- **API Integration**: RESTful API consumption, error handling
- **Software Engineering**: Modular architecture, code organization, testing

## 🚀 Deployment

### Development
```bash
npm run dev
```

### Production Build
```bash
npm run build
npm run preview
```

### Deploy to Lovable
Simply open [Lovable](https://lovable.dev/projects/a0efa270-5b0e-4bd9-92fb-cf3a9e00b0c9) and click Share → Publish.

## 🔮 Future Enhancements

- Cloud storage integration (Google Drive, Dropbox)
- Advanced AI features (speaker identification, sentiment analysis)
- Real-time collaboration and sharing
- Mobile app development (React Native)
- Enterprise features (team workspaces, admin controls)

## 📄 License

This project is created for educational purposes. For commercial use, ensure compliance with relevant API terms of service and privacy regulations.

## 🤝 Contributing

This is a final year project. For educational purposes and demonstration of modern web development practices.

---

**Built with ❤️ for modern voice recording and transcription needs**

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a0efa270-5b0e-4bd9-92fb-cf3a9e00b0c9) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a0efa270-5b0e-4bd9-92fb-cf3a9e00b0c9) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
