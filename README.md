---Made with Claude.ai on Feb 2026---
# Bioacoustics Organization Website

A complete, self-contained website for managing and displaying bioacoustic recordings with admin interface, interactive maps, and multilingual support.

## ✨ Features

### Core Features
- ✅ **Admin Panel** - Upload audio files, manage metadata, batch geolocation
- ✅ **Interactive Maps** - Leaflet-based maps with clustered markers
- ✅ **Audio Player** - Custom player with spectrogram visualization and progress line
- ✅ **7 Languages** - Spanish (default), Portuguese, English, French, German, Chinese, Japanese
- ✅ **Client-Side Storage** - No server needed! Uses IndexedDB + localStorage
- ✅ **Responsive Design** - Works on desktop, tablet, and mobile

### Admin Capabilities
- 📤 Batch file upload (audio + spectrograms)
- 📝 Edit recording metadata (title, species, location, description, etc.)
- 📍 Geolocation via map click OR manual coordinate entry
- 🗺️ Batch geolocation for multiple recordings at once
- 🔍 Search and filter recordings
- 🗑️ Delete recordings

## 🚀 Quick Start

### Option 1: Local Testing (Immediate)

1. Download all files to a folder
2. Open `index.html` in a web browser
3. Go to Admin panel (admin.html)
4. Upload your files and start geolocating!

**Note**: For local file:// protocol, some browsers may restrict IndexedDB. Use Option 2 or 3 for full functionality.

### Option 2: Local Web Server (Recommended for Testing)

**Using Python:**
```bash
cd bioacoustics-site
python -m http.server 8000
```
Then open: `http://localhost:8000`

**Using Node.js (npx):**
```bash
cd bioacoustics-site
npx http-server
```

**Using PHP:**
```bash
cd bioacoustics-site
php -S localhost:8000
```

### Option 3: GitHub Pages (Free Hosting)

1. Create GitHub account at https://github.com
2. Create new repository named `bioacoustics-site`
3. Upload all files to the repository
4. Go to Settings → Pages
5. Select `main` branch as source
6. Your site will be live at: `https://YOUR_USERNAME.github.io/bioacoustics-site/`

## 📖 How to Use

### Admin Workflow

#### 1. Upload Files
- Go to **Admin** → **Upload Files** tab
- Select audio files (MP3, WAV, etc.)
- Optionally upload matching spectrograms (PNG, JPG)
- Click "Process Files"

#### 2. Add Metadata & Geolocation (Two Options)

**Option A: Edit Individual Recordings**
- Go to **Manage Recordings** tab
- Click "✏️ Edit" on any recording
- Fill in metadata (title, species, location, date, etc.)
- Click on map to set location OR enter coordinates manually
- Save changes

**Option B: Batch Geolocation**
- Go to **Batch Geolocation** tab
- Select multiple recordings without locations
- Click on map to set location OR enter coordinates
- Apply to all selected recordings

### Public User Experience

1. **Home Page** - Overview with recording count
2. **Map** - Interactive map showing all geolocated recordings
   - Click markers to see popup with audio player
   - Search by species or location
3. **Recordings** - Grid view of all recordings
   - Search and sort functionality
   - Click any recording for full details
4. **Recording Detail** - Full page with:
   - Audio player synchronized with spectrogram
   - Complete metadata
   - Location map

## 📁 File Structure

```
bioacoustics-site/
├── index.html              # Home page
├── admin.html              # Admin panel
├── map.html                # Public interactive map
├── recordings.html         # Recordings list
├── recording.html          # Individual recording detail
├── people.html             # Team page
├── css/
│   └── style.css           # All styles
├── js/
│   ├── db.js               # Database management (IndexedDB + localStorage)
│   ├── admin.js            # Admin panel functionality
│   ├── map.js              # Public map functionality
│   ├── recordings.js       # Recordings list page
│   ├── recording-detail.js # Individual recording page
│   └── i18n.js             # Multilingual support
└── README.md               # This file
```

## 💾 How Data is Stored

### Client-Side Storage (No Server Required!)

1. **IndexedDB** - Stores actual audio files and spectrogram images
2. **localStorage** - Stores metadata (title, species, coordinates, etc.)

### Data Persistence
- Data persists in the browser even after closing
- Each browser has separate storage
- Clearing browser data will delete recordings

### Export/Import
To backup or transfer data:

```javascript
// In browser console:
// Export
DB.exportData(); // Downloads JSON file

// Import
// Read file and call:
DB.importData(jsonString);
```

## 🎨 Customization

### Change Organization Name
Edit all HTML files, replace "Bioacoustics Organization" with your name.

### Change Colors
Edit `css/style.css`:
```css
/* Primary color */
background: #3498db; /* Blue - change to your color */

/* Gradient */
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Add More Languages
1. Edit `js/i18n.js`
2. Add new language code to translations object
3. Add option to language selector in HTML files

### Customize Team Page
Edit `people.html` with your actual team members.

## 📊 Generating Spectrograms

Spectrograms are optional but highly recommended for the audio player feature.

### Python Method (Recommended)

```python
import librosa
import librosa.display
import matplotlib.pyplot as plt
import numpy as np

def create_spectrogram(audio_path, output_path):
    # Load audio
    y, sr = librosa.load(audio_path)
    
    # Create spectrogram
    D = librosa.amplitude_to_db(np.abs(librosa.stft(y)), ref=np.max)
    
    # Plot
    plt.figure(figsize=(12, 4))
    librosa.display.specshow(D, sr=sr, x_axis='time', y_axis='hz')
    plt.colorbar(format='%+2.0f dB')
    plt.tight_layout()
    plt.axis('off')  # Remove axes for cleaner look
    plt.savefig(output_path, dpi=150, bbox_inches='tight', pad_inches=0)
    plt.close()

# Usage
create_spectrogram('audio.mp3', 'spectrogram.png')
```

Install dependencies:
```bash
pip install librosa matplotlib numpy
```

### R Method

```r
library(seewave)
library(tuneR)

audio <- readWave("audio.wav")
spectro(audio, output = "png", filename = "spectrogram.png")
```

### Batch Processing (Python)

```python
import os
from pathlib import Path

audio_dir = "audio_files"
output_dir = "spectrograms"
os.makedirs(output_dir, exist_ok=True)

for audio_file in Path(audio_dir).glob("*.mp3"):
    output_name = audio_file.stem + ".png"
    output_path = os.path.join(output_dir, output_name)
    create_spectrogram(str(audio_file), output_path)
    print(f"Created: {output_name}")
```

## 🌐 Browser Compatibility

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (iOS 13+)
- Opera: ✅ Full support

**Storage Limits:**
- IndexedDB: Typically 50% of available disk space (browser-dependent)
- localStorage: 5-10 MB (for metadata only, so plenty of space)

## 📱 Mobile Support

The website is fully responsive and works on:
- iOS (Safari, Chrome)
- Android (Chrome, Firefox, Samsung Internet)

## 🔒 Privacy & Data

- All data stored locally in user's browser
- No external servers or databases
- No tracking or analytics
- User has full control over their data

## 🛠️ Troubleshooting

### "Failed to store audio file"
- Check browser storage limits
- Try clearing browser cache (but backup data first!)
- Use smaller file sizes (compress audio to 128-192 kbps)

### "Map not showing markers"
- Ensure recordings have latitude/longitude set
- Check browser console for JavaScript errors

### "Audio player not working"
- Ensure spectrogram is uploaded
- Check audio file format (MP3 and WAV work best)
- Try a different browser

### "Can't upload files in Admin"
- Must use http:// or https:// (not file://)
- Use local web server (see Quick Start Option 2)

## 💡 Tips & Best Practices

1. **File Naming**: Use consistent naming (e.g., `species_001.mp3`, `species_001.png`)
2. **Audio Format**: MP3 128-192 kbps is best for web
3. **Spectrogram Size**: 1200x400 pixels works well
4. **Backup Data**: Export JSON regularly using `DB.exportData()`
5. **Batch Upload**: Process similar recordings together for efficiency

## 🚀 Advanced: Adding Server Backend

This website can be enhanced with a backend for multi-user access:

1. **Node.js + MongoDB**: Store files and metadata in database
2. **PHP + MySQL**: Traditional LAMP stack approach
3. **Firebase**: Google's backend-as-a-service (free tier available)
4. **Supabase**: Open-source Firebase alternative

The client-side code can be adapted to make API calls instead of using local storage.

## 📞 Support & Resources

- **Leaflet Maps**: https://leafletjs.com/reference.html
- **IndexedDB**: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
- **HTML5 Audio**: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/audio
- **librosa (Python)**: https://librosa.org/doc/latest/index.html

## 📄 License

This project is open source. You can freely use, modify, and distribute it for your organization.

## 🙏 Credits

Built with:
- Leaflet (maps)
- Leaflet.markercluster (marker clustering)
- IndexedDB (file storage)
- Web Audio API (audio playback)

---

**Ready to get started?** Upload your first recordings in the Admin panel and watch your bioacoustics collection come to life! 🎵🌍
