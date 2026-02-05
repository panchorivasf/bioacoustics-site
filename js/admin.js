// Admin panel functionality

let uploadedAudioFiles = [];
let uploadedSpectrograms = [];
let editMap = null;
let batchMap = null;
let batchMarker = null;
let selectedRecordingsForBatch = [];

// Tab switching
function showTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
    
    if (tabName === 'manage') {
        loadRecordingsList();
    } else if (tabName === 'batch') {
        loadUngeolocatedList();
        initBatchMap();
    }
}

// File upload handling
document.addEventListener('DOMContentLoaded', () => {
    const audioInput = document.getElementById('audioFiles');
    const spectrogramInput = document.getElementById('spectrogramFiles');
    
    if (audioInput) {
        audioInput.addEventListener('change', (e) => {
            uploadedAudioFiles = Array.from(e.target.files);
            displayFileList('audioFileList', uploadedAudioFiles);
        });
    }
    
    if (spectrogramInput) {
        spectrogramInput.addEventListener('change', (e) => {
            uploadedSpectrograms = Array.from(e.target.files);
            displayFileList('spectrogramFileList', uploadedSpectrograms);
        });
    }
    
    // Load recordings list if on manage tab
    loadRecordingsList();
});

function displayFileList(elementId, files) {
    const container = document.getElementById(elementId);
    container.innerHTML = '';
    
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.innerHTML = `
            <span class="file-name">${file.name}</span>
            <span class="file-size">${(file.size / 1024 / 1024).toFixed(2)} MB</span>
            <button onclick="removeFile('${elementId}', ${index})" class="btn-remove">✕</button>
        `;
        container.appendChild(fileItem);
    });
}

function removeFile(listId, index) {
    if (listId === 'audioFileList') {
        uploadedAudioFiles.splice(index, 1);
        displayFileList('audioFileList', uploadedAudioFiles);
    } else {
        uploadedSpectrograms.splice(index, 1);
        displayFileList('spectrogramFileList', uploadedSpectrograms);
    }
}

// Process uploaded files
async function processUploadedFiles() {
    if (uploadedAudioFiles.length === 0) {
        alert('Por favor, sube al menos un archivo de audio.');
        return;
    }
    
    const btn = event.target;
    btn.disabled = true;
    btn.textContent = 'Procesando...';
    
    for (const audioFile of uploadedAudioFiles) {
        try {
            // Get audio duration
            const duration = await getAudioDuration(audioFile);
            
            // Find matching spectrogram
            const baseName = audioFile.name.replace(/\.[^/.]+$/, '');
            const spectrogram = uploadedSpectrograms.find(s => 
                s.name.startsWith(baseName)
            );
            
            // Determine type based on duration (soundscapes are typically longer)
            const recordingType = duration && duration > 60 ? 'soundscape' : 'focal';
            
            // Create recording entry
            const recording = {
                title: baseName.replace(/_/g, ' '),
                filename: audioFile.name,
                duration: duration,
                hasAudio: true,
                hasSpectrogram: !!spectrogram,
                type: recordingType, // 'focal' or 'soundscape'
                // Default empty geolocation - to be filled later
                latitude: null,
                longitude: null,
                location: '',
                species: '',
                description: '',
                recordist: '',
                date: new Date().toISOString().split('T')[0]
            };
            
            // Save to database
            const saved = DB.addRecording(recording);
            
            // Store audio file in IndexedDB
            await DB.storeAudioFile(saved.id, audioFile);
            
            // Store spectrogram if available
            if (spectrogram) {
                await DB.storeSpectrogram(saved.id, spectrogram);
            }
            
        } catch (error) {
            console.error('Error processing file:', audioFile.name, error);
        }
    }
    
    btn.textContent = '✓ Archivos Procesados';
    setTimeout(() => {
        btn.disabled = false;
        btn.textContent = 'Procesar Archivos y Continuar →';
        uploadedAudioFiles = [];
        uploadedSpectrograms = [];
        displayFileList('audioFileList', []);
        displayFileList('spectrogramFileList', []);
        
        // Switch to batch geolocation tab
        showTab('batch');
    }, 1500);
}

// Load recordings list
function loadRecordingsList() {
    const recordings = DB.getAllRecordings();
    const container = document.getElementById('recordingsList');
    
    if (!container) return;
    
    if (recordings.length === 0) {
        container.innerHTML = '<p class="no-data">No hay grabaciones aún. Sube algunos archivos en la pestaña "Subir Archivos".</p>';
        return;
    }
    
    container.innerHTML = renderRecordingCards(recordings);
}

// Helper function to render recording cards
function renderRecordingCards(recordings) {
    return recordings.map(rec => `
        <div class="recording-card">
            <div class="recording-header">
                <h3>${rec.title}</h3>
                <div class="badge-group">
                    <span class="badge ${rec.type === 'soundscape' ? 'badge-soundscape' : 'badge-focal'}">
                        ${rec.type === 'soundscape' ? '🌳 Paisaje' : '🎵 Focal'}
                    </span>
                    ${rec.latitude && rec.longitude ? 
                        '<span class="badge badge-success">📍</span>' : 
                        '<span class="badge badge-warning">⚠️</span>'}
                </div>
            </div>
            <div class="recording-info">
                ${rec.species ? `<p><strong>Especie:</strong> ${rec.species}</p>` : ''}
                ${rec.location ? `<p><strong>Ubicación:</strong> ${rec.location}</p>` : ''}
                ${rec.latitude ? `<p><strong>Coords:</strong> ${rec.latitude.toFixed(4)}, ${rec.longitude.toFixed(4)}</p>` : ''}
                <p><strong>Duración:</strong> ${rec.duration || '?'}s</p>
            </div>
            <div class="recording-actions">
                <button onclick="editRecording('${rec.id}')" class="btn btn-sm btn-primary">✏️ Editar</button>
                <button onclick="playRecording('${rec.id}')" class="btn btn-sm btn-secondary">▶️ Reproducir</button>
                <button onclick="deleteRecording('${rec.id}')" class="btn btn-sm btn-danger">🗑️ Eliminar</button>
            </div>
        </div>
    `).join('');
}

// Filter recordings
function filterRecordings() {
    const query = document.getElementById('searchRecordings').value;
    const recordings = query ? DB.searchRecordings(query) : DB.getAllRecordings();
    const container = document.getElementById('recordingsList');
    
    // Same display logic as loadRecordingsList but with filtered results
    if (recordings.length === 0) {
        container.innerHTML = '<p class="no-data">No se encontraron grabaciones.</p>';
        return;
    }
    
    container.innerHTML = renderRecordingCards(recordings);
}

// Edit recording
function editRecording(id) {
    const recording = DB.getRecording(id);
    if (!recording) return;
    
    // Fill form
    document.getElementById('editId').value = recording.id;
    document.getElementById('editTitle').value = recording.title || '';
    document.getElementById('editType').value = recording.type || 'focal';
    document.getElementById('editSpecies').value = recording.species || '';
    document.getElementById('editLocation').value = recording.location || '';
    document.getElementById('editDate').value = recording.date || '';
    document.getElementById('editDescription').value = recording.description || '';
    document.getElementById('editRecordist').value = recording.recordist || '';
    document.getElementById('editLat').value = recording.latitude || '';
    document.getElementById('editLng').value = recording.longitude || '';
    
    // Show modal
    document.getElementById('editModal').style.display = 'block';
    
    // Initialize map
    setTimeout(() => initEditMap(recording.latitude, recording.longitude), 100);
}

function initEditMap(lat, lng) {
    if (editMap) {
        editMap.remove();
    }
    
    const center = (lat && lng) ? [lat, lng] : [0, 0];
    const zoom = (lat && lng) ? 10 : 2;
    
    editMap = L.map('editMap').setView(center, zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(editMap);
    
    let marker = null;
    if (lat && lng) {
        marker = L.marker([lat, lng], { draggable: true }).addTo(editMap);
        marker.on('dragend', (e) => {
            const pos = e.target.getLatLng();
            document.getElementById('editLat').value = pos.lat.toFixed(6);
            document.getElementById('editLng').value = pos.lng.toFixed(6);
        });
    }
    
    editMap.on('click', (e) => {
        if (marker) {
            marker.setLatLng(e.latlng);
        } else {
            marker = L.marker(e.latlng, { draggable: true }).addTo(editMap);
            marker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                document.getElementById('editLat').value = pos.lat.toFixed(6);
                document.getElementById('editLng').value = pos.lng.toFixed(6);
            });
        }
        document.getElementById('editLat').value = e.latlng.lat.toFixed(6);
        document.getElementById('editLng').value = e.latlng.lng.toFixed(6);
    });
    
    // Update map when coordinates are manually entered
    document.getElementById('editLat').addEventListener('input', updateEditMapMarker);
    document.getElementById('editLng').addEventListener('input', updateEditMapMarker);
    
    function updateEditMapMarker() {
        const lat = parseFloat(document.getElementById('editLat').value);
        const lng = parseFloat(document.getElementById('editLng').value);
        if (!isNaN(lat) && !isNaN(lng)) {
            if (marker) {
                marker.setLatLng([lat, lng]);
            } else {
                marker = L.marker([lat, lng], { draggable: true }).addTo(editMap);
            }
            editMap.setView([lat, lng], 10);
        }
    }
}

function closeEditModal() {
    document.getElementById('editModal').style.display = 'none';
    if (editMap) {
        editMap.remove();
        editMap = null;
    }
}

// Save edited recording
document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('editForm');
    if (editForm) {
        editForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = document.getElementById('editId').value;
            const updates = {
                title: document.getElementById('editTitle').value,
                type: document.getElementById('editType').value,
                species: document.getElementById('editSpecies').value,
                location: document.getElementById('editLocation').value,
                date: document.getElementById('editDate').value,
                description: document.getElementById('editDescription').value,
                recordist: document.getElementById('editRecordist').value,
                latitude: parseFloat(document.getElementById('editLat').value),
                longitude: parseFloat(document.getElementById('editLng').value)
            };
            
            DB.updateRecording(id, updates);
            closeEditModal();
            loadRecordingsList();
            alert('Grabación actualizada exitosamente!');
        });
    }
});

// Delete recording
function deleteRecording(id) {
    if (confirm('¿Estás seguro de eliminar esta grabación? Esta acción no se puede deshacer.')) {
        DB.deleteRecording(id);
        loadRecordingsList();
    }
}

// Play recording
async function playRecording(id) {
    const audioData = await DB.getAudioFile(id);
    if (!audioData) {
        alert('Archivo de audio no encontrado.');
        return;
    }
    
    const url = URL.createObjectURL(audioData.file);
    const audio = new Audio(url);
    audio.play();
}

// Batch geolocation
function loadUngeolocatedList() {
    const recordings = DB.getUngeolocatedRecordings();
    const container = document.getElementById('ungeolocatedList');
    
    if (!container) return;
    
    if (recordings.length === 0) {
        container.innerHTML = '<p class="no-data">✓ Todas las grabaciones están geolocalizadas!</p>';
        return;
    }
    
    container.innerHTML = recordings.map(rec => `
        <div class="ungeoloc-item">
            <label>
                <input type="checkbox" value="${rec.id}" onchange="toggleBatchSelection('${rec.id}')">
                <span>${rec.title}</span>
            </label>
        </div>
    `).join('');
    
    selectedRecordingsForBatch = [];
}

function toggleBatchSelection(id) {
    const index = selectedRecordingsForBatch.indexOf(id);
    if (index > -1) {
        selectedRecordingsForBatch.splice(index, 1);
    } else {
        selectedRecordingsForBatch.push(id);
    }
}

function initBatchMap() {
    if (batchMap) return; // Already initialized
    
    batchMap = L.map('batchMap').setView([0, 0], 2);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(batchMap);
    
    batchMap.on('click', (e) => {
        if (batchMarker) {
            batchMarker.setLatLng(e.latlng);
        } else {
            batchMarker = L.marker(e.latlng, { draggable: true }).addTo(batchMap);
            batchMarker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                document.getElementById('batchLat').value = pos.lat.toFixed(6);
                document.getElementById('batchLng').value = pos.lng.toFixed(6);
            });
        }
        document.getElementById('batchLat').value = e.latlng.lat.toFixed(6);
        document.getElementById('batchLng').value = e.latlng.lng.toFixed(6);
    });
    
    // Update map when coordinates are manually entered
    document.getElementById('batchLat').addEventListener('input', updateBatchMapMarker);
    document.getElementById('batchLng').addEventListener('input', updateBatchMapMarker);
}

function updateBatchMapMarker() {
    const lat = parseFloat(document.getElementById('batchLat').value);
    const lng = parseFloat(document.getElementById('batchLng').value);
    if (!isNaN(lat) && !isNaN(lng)) {
        if (batchMarker) {
            batchMarker.setLatLng([lat, lng]);
        } else {
            batchMarker = L.marker([lat, lng], { draggable: true }).addTo(batchMap);
            batchMarker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                document.getElementById('batchLat').value = pos.lat.toFixed(6);
                document.getElementById('batchLng').value = pos.lng.toFixed(6);
            });
        }
        batchMap.setView([lat, lng], 10);
    }
}

function applyBatchLocation() {
    if (selectedRecordingsForBatch.length === 0) {
        alert('Selecciona al menos una grabación.');
        return;
    }
    
    const lat = parseFloat(document.getElementById('batchLat').value);
    const lng = parseFloat(document.getElementById('batchLng').value);
    
    if (isNaN(lat) || isNaN(lng)) {
        alert('Por favor, establece coordenadas válidas.');
        return;
    }
    
    selectedRecordingsForBatch.forEach(id => {
        DB.updateRecording(id, { latitude: lat, longitude: lng });
    });
    
    alert(`Se actualizó la ubicación de ${selectedRecordingsForBatch.length} grabación(es).`);
    loadUngeolocatedList();
    selectedRecordingsForBatch = [];
    document.getElementById('batchLat').value = '';
    document.getElementById('batchLng').value = '';
    if (batchMarker) {
        batchMap.removeLayer(batchMarker);
        batchMarker = null;
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('editModal');
    if (event.target === modal) {
        closeEditModal();
    }
};
