// Map functionality for public view

let mainMap = null;
let markers = [];
let markerCluster = null;

document.addEventListener('DOMContentLoaded', () => {
    initMainMap();
    loadMapRecordings();
    
    // Search functionality
    const searchInput = document.getElementById('mapSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterMapMarkers);
    }
});

function initMainMap() {
    mainMap = L.map('recordingMap').setView([0, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mainMap);
    
    // Initialize marker cluster group
    markerCluster = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });
    
    mainMap.addLayer(markerCluster);
}

async function loadMapRecordings() {
    const recordings = DB.getAllRecordings().filter(r => r.latitude && r.longitude);
    
    // Update stats
    const statsEl = document.getElementById('mapStats');
    if (statsEl) {
        statsEl.textContent = `${recordings.length} grabaciones geolocalizadas`;
    }
    
    if (recordings.length === 0) {
        return;
    }
    
    markers = [];
    
    for (const rec of recordings) {
        // Create custom icon
        const iconHtml = `
            <div class="custom-marker">
                🎵
            </div>
        `;
        
        const customIcon = L.divIcon({
            html: iconHtml,
            className: 'custom-marker-container',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
        
        const marker = L.marker([rec.latitude, rec.longitude], { 
            icon: customIcon,
            recId: rec.id,
            title: rec.title
        });
        
        // Create popup content
        const popupContent = await createPopupContent(rec);
        marker.bindPopup(popupContent);
        
        markers.push(marker);
        markerCluster.addLayer(marker);
    }
    
    // Fit bounds to show all markers
    if (markers.length > 0) {
        const bounds = L.latLngBounds(markers.map(m => m.getLatLng()));
        mainMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
}

async function createPopupContent(rec) {
    const hasAudio = rec.hasAudio;
    const audioData = hasAudio ? await DB.getAudioFile(rec.id) : null;
    const spectrogramData = rec.hasSpectrogram ? await DB.getSpectrogram(rec.id) : null;
    
    let audioUrl = '';
    let spectrogramUrl = '';
    
    if (audioData) {
        audioUrl = URL.createObjectURL(audioData.file);
    }
    
    if (spectrogramData) {
        spectrogramUrl = URL.createObjectURL(spectrogramData.file);
    }
    
    return `
        <div class="popup-content">
            <h3>${rec.title}</h3>
            ${rec.species ? `<p><strong>Especie:</strong> ${rec.species}</p>` : ''}
            ${rec.location ? `<p><strong>Ubicación:</strong> ${rec.location}</p>` : ''}
            ${rec.date ? `<p><strong>Fecha:</strong> ${rec.date}</p>` : ''}
            ${rec.recordist ? `<p><strong>Grabador:</strong> ${rec.recordist}</p>` : ''}
            ${rec.duration ? `<p><strong>Duración:</strong> ${rec.duration}s</p>` : ''}
            
            ${spectrogramUrl ? `
                <div class="popup-spectrogram">
                    <img src="${spectrogramUrl}" alt="Espectrograma" style="width: 100%; max-width: 300px;">
                </div>
            ` : ''}
            
            ${audioUrl ? `
                <div class="popup-audio">
                    <audio controls style="width: 100%;">
                        <source src="${audioUrl}" type="${audioData.type}">
                    </audio>
                </div>
            ` : ''}
            
            <div class="popup-actions">
                <button onclick="viewRecordingDetails('${rec.id}')" class="btn btn-sm">Ver detalles →</button>
            </div>
        </div>
    `;
}

function filterMapMarkers() {
    const query = document.getElementById('mapSearch').value.toLowerCase();
    
    if (!query) {
        markerCluster.clearLayers();
        markers.forEach(m => markerCluster.addLayer(m));
        return;
    }
    
    const recordings = DB.searchRecordings(query).filter(r => r.latitude && r.longitude);
    const filteredIds = new Set(recordings.map(r => r.id));
    
    markerCluster.clearLayers();
    markers.filter(m => filteredIds.has(m.options.recId)).forEach(m => markerCluster.addLayer(m));
    
    // Update stats
    const statsEl = document.getElementById('mapStats');
    if (statsEl) {
        statsEl.textContent = `${recordings.length} grabaciones encontradas`;
    }
}

function viewRecordingDetails(id) {
    window.location.href = `recording.html?id=${id}`;
}
