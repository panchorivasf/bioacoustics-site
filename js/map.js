// Map functionality for public view

let mainMap = null;
let markers = [];
let markerCluster = null;
let focalLayer = null;
let soundscapeLayer = null;

// Wait for recordings to load before initializing map
function onRecordingsLoaded() {
    loadMapRecordings();
}

document.addEventListener('DOMContentLoaded', () => {
    initMainMap();
    
    // Search functionality
    const searchInput = document.getElementById('mapSearch');
    if (searchInput) {
        searchInput.addEventListener('input', filterMapMarkers);
    }
    
    // Load recordings if already available, otherwise wait for onRecordingsLoaded
    if (typeof PublicDB !== 'undefined' && PublicDB.getAllRecordings().length > 0) {
        loadMapRecordings();
    }
});

function initMainMap() {
    mainMap = L.map('recordingMap').setView([0, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 18
    }).addTo(mainMap);
    
    // Initialize separate marker cluster groups for each type
    focalLayer = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });
    
    soundscapeLayer = L.markerClusterGroup({
        chunkedLoading: true,
        spiderfyOnMaxZoom: true,
        showCoverageOnHover: false,
        zoomToBoundsOnClick: true
    });
    
    mainMap.addLayer(focalLayer);
    mainMap.addLayer(soundscapeLayer);
}

async function loadMapRecordings() {
    const recordings = PublicDB.getAllRecordings().filter(r => r.latitude && r.longitude);
    
    const focalCount = recordings.filter(r => r.type === 'focal').length;
    const soundscapeCount = recordings.filter(r => r.type === 'soundscape').length;
    
    // Update stats
    const statsEl = document.getElementById('mapStats');
    if (statsEl) {
        statsEl.textContent = `${focalCount} focales, ${soundscapeCount} paisajes sonoros`;
    }
    
    if (recordings.length === 0) {
        return;
    }
    
    markers = [];
    
    for (const rec of recordings) {
        // Determine icon based on type
        const iconEmoji = rec.type === 'soundscape' ? '🌳' : '🎵';
        const iconClass = rec.type === 'soundscape' ? 'soundscape-icon' : 'focal-icon';
        
        // Create custom icon
        const iconHtml = `
            <div class="custom-marker ${iconClass}">
                ${iconEmoji}
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
            recType: rec.type,
            title: rec.title
        });
        
        // Create popup content
        const popupContent = await createPopupContent(rec);
        marker.bindPopup(popupContent);
        
        markers.push(marker);
        
        // Add to appropriate layer
        if (rec.type === 'soundscape') {
            soundscapeLayer.addLayer(marker);
        } else {
            focalLayer.addLayer(marker);
        }
    }
    
    // Fit bounds to show all markers
    if (markers.length > 0) {
        const bounds = L.latLngBounds(markers.map(m => m.getLatLng()));
        mainMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 10 });
    }
}

async function createPopupContent(rec) {
    // Check for local spectrogram
    let spectrogramUrl = null;
    if (rec.xcNumber) {
        const localSpectrogram = `images/spectrograms/spectrogram_XC${rec.xcNumber}.png`;
        try {
            const response = await fetch(localSpectrogram, { method: 'HEAD' });
            if (response.ok) {
                spectrogramUrl = localSpectrogram;
            } else {
                spectrogramUrl = rec.spectrogramUrl;
            }
        } catch {
            spectrogramUrl = rec.spectrogramUrl;
        }
    } else {
        spectrogramUrl = rec.spectrogramUrl;
    }
    
    return `
        <div class="popup-content">
            <h3>${rec.title}</h3>
            ${rec.species ? `<p><strong>Especie:</strong> ${rec.species}</p>` : ''}
            ${rec.location ? `<p><strong>Ubicación:</strong> ${rec.location}</p>` : ''}
            
            ${spectrogramUrl ? `
                <div class="popup-spectrogram">
                    <img src="${spectrogramUrl}" alt="Espectrograma" style="width: 100%; max-width: 400px;">
                </div>
            ` : ''}
            
            ${rec.xcNumber ? `
                <div class="popup-player">
                    <iframe src='https://xeno-canto.org/${rec.xcNumber}/embed?simple=1' scrolling='no' frameborder='0' width='340' height='115'></iframe>
                </div>
            ` : ''}
            
            <a href="recording.html?id=${rec.id}" class="btn btn-primary">Ver detalles</a>
        </div>
    `;
}

function updateMapFilters() {
    const showFocal = document.getElementById('filterFocal').checked;
    const showSoundscape = document.getElementById('filterSoundscape').checked;
    
    if (showFocal) {
        mainMap.addLayer(focalLayer);
    } else {
        mainMap.removeLayer(focalLayer);
    }
    
    if (showSoundscape) {
        mainMap.addLayer(soundscapeLayer);
    } else {
        mainMap.removeLayer(soundscapeLayer);
    }
}

function filterMapMarkers() {
    const query = document.getElementById('mapSearch').value.toLowerCase();
    
    if (!query) {
        // Reset to show all based on current filter settings
        updateMapFilters();
        
        const recordings = PublicDB.getAllRecordings().filter(r => r.latitude && r.longitude);
        const focalCount = recordings.filter(r => r.type === 'focal').length;
        const soundscapeCount = recordings.filter(r => r.type === 'soundscape').length;
        
        const statsEl = document.getElementById('mapStats');
        if (statsEl) {
            statsEl.textContent = `${focalCount} focales, ${soundscapeCount} paisajes sonoros`;
        }
        return;
    }
    
    const recordings = PublicDB.searchRecordings(query).filter(r => r.latitude && r.longitude);
    const filteredIds = new Set(recordings.map(r => r.id));
    
    // Clear both layers
    focalLayer.clearLayers();
    soundscapeLayer.clearLayers();
    
    // Add only filtered markers back
    markers.filter(m => filteredIds.has(m.options.recId)).forEach(m => {
        if (m.options.recType === 'soundscape') {
            soundscapeLayer.addLayer(m);
        } else {
            focalLayer.addLayer(m);
        }
    });
    
    // Update stats
    const focalCount = recordings.filter(r => r.type === 'focal').length;
    const soundscapeCount = recordings.filter(r => r.type === 'soundscape').length;
    
    const statsEl = document.getElementById('mapStats');
    if (statsEl) {
        statsEl.textContent = `${focalCount} focales, ${soundscapeCount} paisajes sonoros encontrados`;
    }
}

function viewRecordingDetails(id) {
    window.location.href = `recording.html?id=${id}`;
}
