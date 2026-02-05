// Public recordings page functionality

let currentRecordings = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPublicRecordings();
});

function loadPublicRecordings() {
    currentRecordings = DB.getAllRecordings();
    displayRecordings(currentRecordings);
}

function displayRecordings(recordings) {
    const container = document.getElementById('recordingsGrid');
    
    if (recordings.length === 0) {
        container.innerHTML = '<p class="no-data">No hay grabaciones disponibles aún.</p>';
        return;
    }
    
    container.innerHTML = recordings.map(rec => `
        <div class="public-recording-card" onclick="viewRecordingDetails('${rec.id}')">
            <div class="recording-thumbnail">
                ${rec.hasSpectrogram ? 
                    '<div class="thumbnail-placeholder">📊</div>' : 
                    '<div class="thumbnail-placeholder">🎵</div>'}
            </div>
            <div class="recording-content">
                <h3>${rec.title}</h3>
                ${rec.species ? `<p class="species"><strong>Especie:</strong> ${rec.species}</p>` : ''}
                ${rec.location ? `<p class="location">📍 ${rec.location}</p>` : ''}
                <div class="recording-meta">
                    ${rec.duration ? `<span>⏱️ ${rec.duration}s</span>` : ''}
                    ${rec.date ? `<span>📅 ${rec.date}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function searchPublicRecordings() {
    const query = document.getElementById('searchRecordings').value;
    const results = query ? DB.searchRecordings(query) : DB.getAllRecordings();
    currentRecordings = results;
    displayRecordings(results);
}

function sortRecordings() {
    const sortBy = document.getElementById('sortBy').value;
    
    const sorted = [...currentRecordings].sort((a, b) => {
        switch (sortBy) {
            case 'title':
                return (a.title || '').localeCompare(b.title || '');
            case 'species':
                return (a.species || '').localeCompare(b.species || '');
            case 'location':
                return (a.location || '').localeCompare(b.location || '');
            case 'recent':
            default:
                return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        }
    });
    
    displayRecordings(sorted);
}

function viewRecordingDetails(id) {
    window.location.href = `recording.html?id=${id}`;
}
