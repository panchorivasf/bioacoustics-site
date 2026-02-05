// Public site loader - loads recordings from JSON file instead of localStorage

let publicRecordings = [];

// Load recordings from JSON file
async function loadPublicRecordings() {
    try {
        const response = await fetch('data/recordings.json');
        if (!response.ok) {
            console.warn('No recordings file found');
            return [];
        }
        const recordings = await response.json();
        console.log(`Loaded ${recordings.length} recordings from JSON`);
        return recordings;
    } catch (error) {
        console.error('Error loading recordings:', error);
        return [];
    }
}

// Initialize recordings on page load
async function initPublicDB() {
    publicRecordings = await loadPublicRecordings();
    
    // Trigger page-specific initialization after recordings are loaded
    if (typeof onRecordingsLoaded === 'function') {
        onRecordingsLoaded();
    }
}

// Public DB API that replaces the old localStorage-based DB
const PublicDB = {
    getAllRecordings() {
        return publicRecordings;
    },
    
    getRecording(id) {
        return publicRecordings.find(r => r.id === id);
    },
    
    searchRecordings(query) {
        if (!query) return publicRecordings;
        
        const lowerQuery = query.toLowerCase();
        return publicRecordings.filter(r => 
            (r.title && r.title.toLowerCase().includes(lowerQuery)) ||
            (r.species && r.species.toLowerCase().includes(lowerQuery)) ||
            (r.scientificName && r.scientificName.toLowerCase().includes(lowerQuery)) ||
            (r.commonName && r.commonName.toLowerCase().includes(lowerQuery)) ||
            (r.location && r.location.toLowerCase().includes(lowerQuery)) ||
            (r.description && r.description.toLowerCase().includes(lowerQuery)) ||
            (r.xcNumber && r.xcNumber.toString().includes(query))
        );
    }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPublicDB);
} else {
    // DOM already loaded
    initPublicDB();
}
