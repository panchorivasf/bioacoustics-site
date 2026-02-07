// Recording detail page functionality

let audio = null;
let detailMap = null;

// Format text with basic markdown-style formatting
function formatText(text) {
    if (!text) return '';
    
    // Escape HTML first
    text = text.replace(/&/g, '&amp;')
               .replace(/</g, '&lt;')
               .replace(/>/g, '&gt;');
    
    // Apply markdown-style formatting
    // Bold: **text** or __text__
    text = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
               .replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_
    text = text.replace(/\*(.+?)\*/g, '<em>$1</em>')
               .replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Line breaks
    text = text.replace(/\n/g, '<br>');
    
    return text;
}

// Wait for recordings to load
function onRecordingsLoaded() {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
        document.getElementById('recordingContent').innerHTML = '<p class="error">Grabación no encontrada.</p>';
        return;
    }
    
    loadRecordingDetail(id);
}

document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get('id');
    
    if (!id) {
        document.getElementById('recordingContent').innerHTML = '<p class="error">Grabación no encontrada.</p>';
        return;
    }
    
    // Load if recordings already available
    if (typeof PublicDB !== 'undefined' && PublicDB.getAllRecordings().length > 0) {
        loadRecordingDetail(id);
    }
});

async function loadRecordingDetail(id) {
    const recording = PublicDB.getRecording(id);
    
    if (!recording) {
        document.getElementById('recordingContent').innerHTML = '<p class="error">Grabación no encontrada.</p>';
        return;
    }
    
    // Use direct URLs from Xeno-canto
    const audioUrl = recording.audioUrl;
    
    // Check for custom local spectrogram first, then XC spectrogram
    let spectrogramUrl = null;
    if (recording.xcNumber) {
        // Try local spectrogram first
        const localSpectrogram = `images/spectrograms/spectrogram_XC${recording.xcNumber}.png`;
        
        // Test if file exists
        try {
            const response = await fetch(localSpectrogram, { method: 'HEAD' });
            if (response.ok) {
                spectrogramUrl = localSpectrogram;
            } else {
                // Fallback to XC spectrogram
                spectrogramUrl = recording.spectrogramUrl;
            }
        } catch {
            // Fallback to XC spectrogram
            spectrogramUrl = recording.spectrogramUrl;
        }
    } else {
        spectrogramUrl = recording.spectrogramUrl;
    }
    
    const content = `
        <h1>${recording.title}</h1>
        
        ${recording.xenoCantoUrl ? `
            <div class="xc-link">
                <a href="${recording.xenoCantoUrl}" target="_blank" class="btn btn-primary">
                    🔗 Ver en Xeno-canto
                </a>
            </div>
        ` : ''}
        
        ${spectrogramUrl ? `
            <div class="spectrogram-display">
                <h3>Espectrograma</h3>
                <img src="${spectrogramUrl}" alt="Espectrograma" class="spectrogram">
            </div>
        ` : ''}
        
        ${recording.xcNumber ? `
            <div class="xc-player">
                <h3>Audio</h3>
                <iframe src='https://xeno-canto.org/${recording.xcNumber}/embed?simple=1' scrolling='no' frameborder='0' width='900' height='150'></iframe>
            </div>
        ` : audioUrl ? `
            <div class="audio-player-simple">
                <h3>Audio</h3>
                <audio controls>
                    <source src="${audioUrl}" type="audio/mpeg">
                </audio>
            </div>
        ` : ''}
        
        <div class="metadata-grid">
            ${recording.species ? `
                <div class="metadata-item">
                    <strong>Especie:</strong>
                    <span>${recording.species}</span>
                </div>
            ` : ''}
            
            ${recording.location ? `
                <div class="metadata-item">
                    <strong>Ubicación:</strong>
                    <span>${recording.location}</span>
                </div>
            ` : ''}
            
            ${recording.date ? `
                <div class="metadata-item">
                    <strong>Fecha:</strong>
                    <span>${recording.date}</span>
                </div>
            ` : ''}
            
            ${recording.recordist ? `
                <div class="metadata-item">
                    <strong>Grabador:</strong>
                    <span>${recording.recordist}</span>
                </div>
            ` : ''}
            
            ${recording.duration ? `
                <div class="metadata-item">
                    <strong>Duración:</strong>
                    <span>${recording.duration} segundos</span>
                </div>
            ` : ''}
            
            ${recording.quality ? `
                <div class="metadata-item">
                    <strong>Calidad:</strong>
                    <span>${recording.quality}</span>
                </div>
            ` : ''}
            
            ${recording.xcType ? `
                <div class="metadata-item">
                    <strong>Tipo de grabación:</strong>
                    <span>${recording.xcType}</span>
                </div>
            ` : ''}
            
            ${recording.latitude && recording.longitude ? `
                <div class="metadata-item">
                    <strong>Coordenadas:</strong>
                    <span>${recording.latitude.toFixed(4)}, ${recording.longitude.toFixed(4)}</span>
                </div>
            ` : ''}
            
            ${recording.xcNumber ? `
                <div class="metadata-item">
                    <strong>Xeno-canto:</strong>
                    <span>XC${recording.xcNumber}</span>
                </div>
            ` : ''}
        </div>
        
        ${recording.remarks ? `
            <div class="description-section">
                <h3>Notas del grabador</h3>
                <p>${formatText(recording.remarks)}</p>
            </div>
        ` : ''}
        
        ${recording.description ? `
            <div class="description-section">
                <h2>Descripción</h2>
                <p>${formatText(recording.description)}</p>
            </div>
        ` : ''}
        
        ${recording.latitude && recording.longitude ? `
            <div class="location-section">
                <h2>Ubicación</h2>
                <div id="detailMap" style="height: 400px; width: 100%;"></div>
            </div>
        ` : ''}
    `;
    
    document.getElementById('recordingContent').innerHTML = content;
    
    // Initialize audio player if spectrogram is present
    if (audioUrl && spectrogramUrl) {
        initAudioPlayer();
    }
    
    // Initialize map if coordinates are present
    if (recording.latitude && recording.longitude) {
        setTimeout(() => initDetailMap(recording.latitude, recording.longitude), 100);
    }
}

function initAudioPlayer() {
    audio = document.getElementById('audioPlayer');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const seekBar = document.getElementById('seekBar');
    const volumeBar = document.getElementById('volumeBar');
    const currentTimeSpan = document.getElementById('currentTime');
    const durationSpan = document.getElementById('duration');
    const progressLine = document.getElementById('progressLine');
    const spectrogramContainer = document.querySelector('.spectrogram-container');
    
    if (!audio) return;
    
    // Play/Pause
    playPauseBtn.addEventListener('click', () => {
        if (audio.paused) {
            audio.play();
            playPauseBtn.textContent = '⏸️ Pausar';
        } else {
            audio.pause();
            playPauseBtn.textContent = '▶️ Reproducir';
        }
    });
    
    // Update time and progress line
    audio.addEventListener('timeupdate', () => {
        const percent = (audio.currentTime / audio.duration) * 100;
        seekBar.value = percent;
        
        // Update progress line on spectrogram
        const linePosition = (audio.currentTime / audio.duration) * spectrogramContainer.offsetWidth;
        progressLine.style.left = linePosition + 'px';
        
        currentTimeSpan.textContent = formatTime(audio.currentTime);
    });
    
    // Load duration
    audio.addEventListener('loadedmetadata', () => {
        durationSpan.textContent = formatTime(audio.duration);
    });
    
    // Seek
    seekBar.addEventListener('input', () => {
        const time = (seekBar.value / 100) * audio.duration;
        audio.currentTime = time;
    });
    
    // Volume
    volumeBar.addEventListener('input', () => {
        audio.volume = volumeBar.value / 100;
    });
    
    // Click on spectrogram to seek
    spectrogramContainer.addEventListener('click', (e) => {
        const rect = spectrogramContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const percent = x / rect.width;
        audio.currentTime = percent * audio.duration;
    });
    
    // Reset button text when audio ends
    audio.addEventListener('ended', () => {
        playPauseBtn.textContent = '▶️ Reproducir';
    });
}

function initDetailMap(lat, lng) {
    detailMap = L.map('detailMap').setView([lat, lng], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(detailMap);
    
    L.marker([lat, lng]).addTo(detailMap);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
}
