# Voice Recorder - Troubleshooting Guide

## 🚨 Common Issues and Solutions

### 1. **Speech Recognition Errors**

#### **Error: "Speech recognition not supported in this browser"**
**Solution:**
- Use Chrome, Edge, or Safari browsers
- Firefox has limited speech recognition support
- Ensure you're using a recent browser version

#### **Error: "Microphone access denied"**
**Solution:**
1. Click the microphone icon in your browser's address bar
2. Select "Allow" for microphone access
3. Refresh the page and try again
4. Check your system's microphone permissions

#### **Error: "No speech detected"**
**Solution:**
- Speak louder and closer to the microphone
- Check if your microphone is working in other applications
- Ensure there's no background noise
- Try a different microphone if available

#### **Error: "Network error"**
**Solution:**
- Check your internet connection
- Speech recognition requires internet connectivity
- Try refreshing the page
- Check if your firewall is blocking the connection

### 2. **Transcription Issues**

#### **Real-time transcription not working**
**Debugging Steps:**
1. Check the "Debug Information" panel in the app
2. Verify browser support status
3. Ensure microphone permissions are granted
4. Try speaking clearly and loudly
5. Check browser console for error messages

#### **Whisper API errors**
**Common Issues:**
- **Invalid API Key**: Verify your OpenAI API key is correct
- **Insufficient Credits**: Check your OpenAI account balance
- **File Size Limit**: Ensure audio files are under 25MB
- **Rate Limits**: Wait a moment and try again

### 3. **Browser-Specific Issues**

#### **Chrome**
- ✅ Full support for speech recognition
- ✅ Best performance for transcription
- ✅ Supports all features

#### **Edge**
- ✅ Full support for speech recognition
- ✅ Good performance
- ✅ Supports all features

#### **Safari**
- ⚠️ Limited speech recognition support
- ⚠️ May have intermittent issues
- ✅ Whisper API works fine

#### **Firefox**
- ❌ No speech recognition support
- ✅ Whisper API works fine
- 💡 Use Whisper for transcription in Firefox

### 4. **Audio Recording Issues**

#### **Recording not starting**
**Solution:**
1. Allow microphone access when prompted
2. Check if another application is using the microphone
3. Restart the browser
4. Check system audio settings

#### **Poor audio quality**
**Solution:**
- Use a good quality microphone
- Minimize background noise
- Speak at a moderate pace
- Maintain consistent distance from microphone

### 5. **Performance Issues**

#### **App running slowly**
**Solution:**
- Close other browser tabs
- Restart the browser
- Clear browser cache
- Check available system memory

#### **Transcription taking too long**
**Solution:**
- For browser transcription: This is normal, it's real-time
- For Whisper: Check your internet connection speed
- Try shorter recordings first

## 🔧 Debugging Steps

### **Step 1: Check Browser Console**
1. Open browser developer tools (F12)
2. Go to Console tab
3. Look for error messages
4. Check for any red error messages

### **Step 2: Verify Browser Support**
1. Open the app
2. Look at the "Debug Information" panel
3. Check "Browser Support" status
4. Verify the current browser and version

### **Step 3: Test Microphone**
1. Go to browser settings
2. Check microphone permissions
3. Test microphone in other applications
4. Try a different microphone

### **Step 4: Test Internet Connection**
1. Ensure stable internet connection
2. Try accessing other websites
3. Check if speech recognition services are accessible
4. Test Whisper API connectivity

## 🛠️ Advanced Troubleshooting

### **Reset Application State**
1. Clear browser localStorage:
   ```javascript
   localStorage.clear();
   ```
2. Refresh the page
3. Reconfigure settings

### **Check System Requirements**
- **Operating System**: Windows 10+, macOS 10.14+, or Linux
- **Browser**: Chrome 80+, Edge 80+, Safari 14+
- **Internet**: Stable connection required
- **Microphone**: Working microphone required

### **Network Issues**
If you're behind a corporate firewall:
1. Check if speech recognition services are blocked
2. Contact IT administrator
3. Try using Whisper API instead
4. Use a different network if possible

## 📞 Getting Help

### **Before Asking for Help:**
1. Check this troubleshooting guide
2. Try the debugging steps above
3. Note the exact error message
4. Check browser console for errors
5. Note your browser and version

### **Information to Provide:**
- Browser name and version
- Operating system
- Exact error message
- Steps to reproduce the issue
- Screenshots if helpful

### **Common Error Messages and Solutions:**

| Error Message | Solution |
|---------------|----------|
| "Speech recognition not supported" | Use Chrome, Edge, or Safari |
| "Microphone access denied" | Allow microphone in browser settings |
| "No speech detected" | Speak louder, check microphone |
| "Network error" | Check internet connection |
| "Invalid API key" | Verify Whisper API key |
| "Service not allowed" | Check browser permissions |

## 🎯 Quick Fixes

### **For Immediate Issues:**
1. **Refresh the page** - Solves most temporary issues
2. **Allow microphone access** - Required for recording
3. **Use Chrome browser** - Best compatibility
4. **Check internet connection** - Required for speech recognition
5. **Clear browser cache** - Resolves caching issues

### **For Persistent Issues:**
1. **Try a different browser** - Test compatibility
2. **Use Whisper API** - More reliable than browser recognition
3. **Check system audio** - Ensure microphone works
4. **Restart browser** - Clears any stuck processes
5. **Update browser** - Get latest features and fixes

## 📋 Testing Checklist

Before reporting issues, please verify:

- [ ] Browser supports speech recognition (Chrome/Edge/Safari)
- [ ] Microphone access is granted
- [ ] Internet connection is stable
- [ ] No other apps are using the microphone
- [ ] Browser is up to date
- [ ] JavaScript is enabled
- [ ] No browser extensions are interfering
- [ ] System audio is working

## 🔄 Recovery Steps

If the app stops working:

1. **Refresh the page**
2. **Clear browser cache**
3. **Restart the browser**
4. **Check microphone permissions**
5. **Verify internet connection**
6. **Try a different browser**
7. **Reset application settings**

---

**Remember**: Most issues are related to browser compatibility or microphone permissions. Chrome provides the best experience for this application.
