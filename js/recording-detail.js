// Recording detail page functionality

let audio = null;
let detailMap = null;

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
    
    // Use direct URLs from Xeno-canto (no need to fetch from IndexedDB)
    const audioUrl = recording.audioUrl;
    const spectrogramUrl = recording.spectrogramUrl;
    
    const content = `
        <h1>${recording.title}</h1>
        
        ${recording.xenoCantoUrl ? `
            <div class="xc-link">
                <a href="${recording.xenoCantoUrl}" target="_blank" class="btn btn-primary">
                    🔗 Ver en Xeno-canto
                </a>
            </div>
        ` : ''}
        
        ${audioUrl && spectrogramUrl ? `
            <div class="audio-player-container">
                <div class="spectrogram-container">
                    <img src="${spectrogramUrl}" alt="Espectrograma" class="spectrogram" id="spectrogram">
                    <div class="progress-line" id="progressLine"></div>
                </div>
                
                <div class="audio-controls">
                    <audio id="audioPlayer" preload="metadata">
                        <source src="${audioUrl}" type="audio/mpeg">
                    </audio>
                    
                    <button id="playPauseBtn" class="btn-play">▶️ Reproducir</button>
                    <input type="range" id="seekBar" value="0" max="100" step="0.1">
                    <span id="currentTime">0:00</span> / <span id="duration">0:00</span>
                    <input type="range" id="volumeBar" value="100" max="100" step="1" title="Volumen">
                </div>
            </div>
        ` : audioUrl ? `
            <div class="audio-player-simple">
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
                <p>${recording.remarks}</p>
            </div>
        ` : ''}
        
        ${recording.description ? `
            <div class="description-section">
                <h2>Descripción</h2>
                <p>${recording.description}</p>
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
