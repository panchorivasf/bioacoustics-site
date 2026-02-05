# Quick Start Guide - Bioacoustics Website

## 🚀 Get Your Site Online in 5 Steps

### Step 1: Get the Files
Download this folder to your computer.

### Step 2: Create GitHub Account & Repository
1. Go to https://github.com
2. Sign up for free account (if you don't have one)
3. Click "New repository"
4. Name it: `bioacoustics-site` (or your preferred name)
5. Make it **PUBLIC** (required for free GitHub Pages)
6. Click "Create repository"

### Step 3: Upload Files
Two options:

**Option A - Simple (Web Upload):**
1. Click "uploading an existing file"
2. Drag ALL files from the `bioacoustics-site` folder
3. Click "Commit changes"

**Option B - Git Command Line:**
```bash
cd bioacoustics-site
git init
git add .
git commit -m "Initial site"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/bioacoustics-site.git
git push -u origin main
```

### Step 4: Enable GitHub Pages
1. In your repo, go to **Settings** (top menu)
2. Click **Pages** (left sidebar)
3. Under "Source": select `main` branch
4. Click **Save**
5. Wait 2-3 minutes

### Step 5: Visit Your Site!
Your site is now live at:
```
https://YOUR_USERNAME.github.io/bioacoustics-site/
```

---

## 📁 Adding Your Recordings

### Where to Put Files:

```
bioacoustics-site/
├── assets/
│   ├── audio/
│   │   ├── recordings/        ← Put 5-10 sec audio here
│   │   └── soundscapes/       ← Put 10 min audio here
│   └── images/
│       └── spectrograms/      ← Put spectrograms here
├── _recordings/               ← Add .md files describing each recording
└── _soundscapes/              ← Add .md files describing each soundscape
```

### Example: Adding One Recording

1. **Prepare files:**
   - Audio: `chucao_001.mp3`
   - Spectrogram: `chucao_001.png`

2. **Upload to GitHub:**
   - Put audio in: `assets/audio/recordings/`
   - Put spectrogram in: `assets/images/spectrograms/`

3. **Create description file** in `_recordings/`:
   - Name it: `chucao-001.md`
   - Copy this template:

```markdown
---
layout: recording
title: "Chucao Song"
species: "Scelorchilus rubecula"
location: "Nahuelbuta NP, Chile"
date: "2024-03-15"
latitude: -37.8167
longitude: -73.0167
recordist: "Your Name"
equipment: "Your recorder"
audio: "/assets/audio/recordings/chucao_001.mp3"
spectrogram: "/assets/images/spectrograms/chucao_001.png"
duration: 8
---

Description of your recording here.
```

4. **Commit changes** on GitHub

5. **Done!** Your recording appears automatically on the site.

---

## 🎨 Basic Customization

### Change Site Title
Edit `_config.yml`:
```yaml
title: "Your Organization Name"
```

### Change Colors
Edit `assets/css/style.css`, look for:
```css
background: #3498db;  /* Change this color */
```

### Add Your Team
Edit `people.html` with your team members

---

## 🆘 Common Issues

### "Page Not Found"
- Wait 5 minutes after enabling GitHub Pages
- Check Settings → Pages shows green checkmark
- Verify URL is exactly: `https://USERNAME.github.io/REPO-NAME/`

### "Audio Won't Play"
- Make sure file path in .md matches actual location
- Use forward slashes: `/assets/audio/file.mp3`
- File names are case-sensitive

### "Map Shows Nothing"
- Make sure you have at least one recording with latitude/longitude
- Check browser console for JavaScript errors

---

## 📊 Generating Spectrograms

### Quick Python Script:
```python
import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np

def make_spectrogram(audio_file, output_file):
    y, sr = librosa.load(audio_file)
    D = librosa.amplitude_to_db(np.abs(librosa.stft(y)), ref=np.max)
    plt.figure(figsize=(12, 4))
    librosa.display.specshow(D, sr=sr, x_axis='time', y_axis='hz')
    plt.tight_layout()
    plt.savefig(output_file, dpi=150, bbox_inches='tight')
    plt.close()

# Use it:
make_spectrogram('my-audio.mp3', 'my-spectrogram.png')
```

Install required package:
```bash
pip install librosa matplotlib
```

---

## 📞 Need Help?

- Check the full README.md for detailed info
- Jekyll docs: https://jekyllrb.com/docs/
- GitHub Pages: https://docs.github.com/pages

---

Good luck with your bioacoustics website! 🎵🌍
