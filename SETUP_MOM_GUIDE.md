# Setup Guide - Minutes of Meeting (MoM) Feature

This guide will help you set up the AI-powered Minutes of Meeting feature for consultation sessions.

## 📋 Overview

The MoM feature automatically:
- 🎤 Transcribes audio/video recordings from consultation sessions
- 📝 Generates structured summaries in Indonesian
- ✅ Extracts key points and action items
- 💡 Provides recommendations for clients
- 🎥 Supports video files (auto-converts to audio)

---

## 🚀 Setup Steps

### Step 1: Get Google Gemini API Key (FREE)

1. Go to: **https://aistudio.google.com/app/apikey**
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy your API key (looks like: `AIzaSy...`)

### Step 2: Add API Key to Environment

Open `api/.env` file and update:

```env
GEMINI_API_KEY=AIzaSy...your-actual-key-here
```

### Step 3: Install FFmpeg (Required for Video Conversion)

#### Windows:
```bash
# Using Chocolatey
choco install ffmpeg

# OR download manually from: https://ffmpeg.org/download.html
# Add to PATH: C:\Program Files\ffmpeg\bin
```

#### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install ffmpeg
```

#### macOS:
```bash
brew install ffmpeg
```

#### Verify Installation:
```bash
ffmpeg -version
```

### Step 4: Create Upload Directory

```bash
mkdir -p api/uploads/mom
```

### Step 5: Restart API Server

```bash
# Stop current server (Ctrl+C)
# Then restart
cd api
npm run dev
```

---

## ✅ Testing the Feature

### Test Flow:

1. **Login as Consultant** (role: 'konsultan')
2. **Go to a completed consultation session**
3. **Click "Buat Notulensi" button**
4. **Upload an audio or video file**:
   - Audio: MP3, M4A, WAV, WEBM, OGG
   - Video: MP4, MOV, AVI, MKV (auto-converted to audio)
5. **Wait for processing**:
   - Audio files: 2-5 minutes
   - Video files: 5-10 minutes (includes conversion time)
6. **Review AI-generated content**:
   - Full transcript (read-only)
   - Summary (editable)
   - Key points (read-only)
   - Action items (read-only)
   - Recommendations (editable)
7. **Edit if needed** and click **"Simpan Draft"**
8. **Publish** when ready using **"Publikasi"** button

---

## 📹 Recording Video Conferences

### Zoom:
1. Start meeting
2. Click **"Record"** → **"Record to this Computer"**
3. End meeting
4. Zoom will convert recording to MP4
5. Upload MP4 file to MoM system

### Google Meet:
1. Start meeting
2. Click **"Activities"** → **"Recording"**
3. Click **"Start Recording"**
4. End meeting
5. Google will email you the MP4 file
6. Upload MP4 file to MoM system

### What Happens After Upload:
- Video is automatically converted to MP3 audio (90% smaller)
- Original video file is deleted to save space
- Audio is sent to Gemini AI for processing
- Results appear in MoM editor

---

## 🔧 Troubleshooting

### Issue: "Failed to process audio"
**Solutions:**
- Verify `GEMINI_API_KEY` is set correctly
- Check FFmpeg is installed: `ffmpeg -version`
- Check API server console for error logs

### Issue: Video conversion fails
**Solutions:**
- Ensure FFmpeg is installed and in PATH
- Try uploading smaller video file (<100MB)
- Check file format is supported

### Issue: Processing takes too long
**Solutions:**
- Audio files <30 min: 2-5 minutes normal
- Video files: Add 3-5 minutes for conversion
- Check file size: <200MB recommended

### Issue: AI results not in Indonesian
**Solution:**
- The prompt is set to Indonesian by default
- If results are in English, check [gemini.service.ts](api/src/systems/ai/gemini.service.ts:38) prompt

---

## 📊 Pricing & Limits

### Google Gemini API (as of 2025):
- **Free tier**: 15 requests per day
- **Paid**: $0.002 per 1,000 characters
- **Audio files**: Charged by duration (free for files <30 seconds)

### Estimated Costs:
- 1-hour consultation: ~$0.10-0.20
- 100 consultations/month: ~$10-20

### File Size Limits:
- Upload: 200MB per file
- Gemini API: Files up to 1 hour recommended

---

## 🎯 Best Practices

### For Consultants:
1. **Test with short audio first** (5-10 minutes)
2. **Speak clearly** in Indonesian for best transcription
3. **Use good quality microphone** if possible
4. **Record in quiet environment**
5. **Review and edit** AI output before publishing

### For Production:
1. **Set up Redis queue** for better scalability
2. **Add retry logic** for failed processing
3. **Implement notifications** when MoM is ready
4. **Monitor API usage** to control costs
5. **Consider using cloud storage** (S3) for files

---

## 🚀 Production Recommendations

### 1. Enable Queue System (Optional)
Currently using synchronous processing. For production:

**Install Redis:**
```bash
# Ubuntu/Debian
sudo apt install redis-server

# Windows
# Download from: https://redis.io/download
```

**Update .env:**
```env
REDIS_HOST=localhost
REDIS_PORT=6379
```

**Run Worker Process:**
```bash
cd api
npm run worker
```

### 2. Use Cloud Storage (Optional)
Replace local file storage with AWS S3 or similar.

### 3. Add Error Notifications
Implement email/push notifications when processing fails.

---

## 📞 Support

If you encounter issues:

1. **Check API server logs**: `cd api && npm run dev`
2. **Verify environment variables**: `cat api/.env`
3. **Test FFmpeg**: `ffmpeg -version`
4. **Test Gemini API**: Use their online playground

---

## 📚 Related Files

- **Backend Service**: [minutes.service.ts](api/src/systems/consultation/services/minutes.service.ts)
- **AI Processing**: [gemini.service.ts](api/src/systems/ai/gemini.service.ts)
- **Video Conversion**: [video-conversion.service.ts](api/src/systems/ai/video-conversion.service.ts)
- **API Routes**: [minutes.routes.ts](api/src/systems/consultation/routes/minutes.routes.ts)
- **Frontend - Upload**: [MoMCreator.tsx](src/components/consultation/MoMCreator.tsx)
- **Frontend - Editor**: [MoMEditor.tsx](src/components/consultation/MoMEditor.tsx)
- **Types**: [consultation.ts](src/types/consultation.ts)

---

## ✨ Feature Status

- ✅ Audio file upload (MP3, M4A, WAV, etc.)
- ✅ Video file upload (MP4, MOV, AVI, MKV)
- ✅ Auto video-to-audio conversion
- ✅ AI transcription (Indonesian)
- ✅ AI summarization
- ✅ Key points extraction
- ✅ Action items detection
- ✅ Recommendations generation
- ✅ Edit before publish
- ⏳ Redis queue (optional for production)
- ⏳ Email notifications (to be implemented)

---

**Last Updated**: January 2025
**Version**: 1.0.0
