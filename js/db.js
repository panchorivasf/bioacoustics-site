// Database management using localStorage (IndexedDB for audio files)

const DB = {
    // Initialize IndexedDB for storing audio files
    async initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('BioacousticsDB', 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                
                // Create object stores
                if (!db.objectStoreNames.contains('audioFiles')) {
                    db.createObjectStore('audioFiles', { keyPath: 'id' });
                }
                if (!db.objectStoreNames.contains('spectrograms')) {
                    db.createObjectStore('spectrograms', { keyPath: 'id' });
                }
            };
        });
    },

    // Store audio file in IndexedDB
    async storeAudioFile(id, file) {
        const db = await this.initDB();
        const transaction = db.transaction(['audioFiles'], 'readwrite');
        const store = transaction.objectStore('audioFiles');
        
        return new Promise((resolve, reject) => {
            const request = store.put({ id, file, filename: file.name, type: file.type });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // Store spectrogram in IndexedDB
    async storeSpectrogram(id, file) {
        const db = await this.initDB();
        const transaction = db.transaction(['spectrograms'], 'readwrite');
        const store = transaction.objectStore('spectrograms');
        
        return new Promise((resolve, reject) => {
            const request = store.put({ id, file, filename: file.name, type: file.type });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    },

    // Get audio file from IndexedDB
    async getAudioFile(id) {
        const db = await this.initDB();
        const transaction = db.transaction(['audioFiles'], 'readonly');
        const store = transaction.objectStore('audioFiles');
        
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // Get spectrogram from IndexedDB
    async getSpectrogram(id) {
        const db = await this.initDB();
        const transaction = db.transaction(['spectrograms'], 'readonly');
        const store = transaction.objectStore('spectrograms');
        
        return new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    },

    // Recording metadata (stored in localStorage)
    getAllRecordings() {
        const recordings = localStorage.getItem('recordings');
        return recordings ? JSON.parse(recordings) : [];
    },

    getRecording(id) {
        const recordings = this.getAllRecordings();
        return recordings.find(r => r.id === id);
    },

    addRecording(recording) {
        const recordings = this.getAllRecordings();
        recording.id = recording.id || this.generateId();
        recording.createdAt = new Date().toISOString();
        recordings.push(recording);
        localStorage.setItem('recordings', JSON.stringify(recordings));
        return recording;
    },

    updateRecording(id, updates) {
        const recordings = this.getAllRecordings();
        const index = recordings.findIndex(r => r.id === id);
        if (index !== -1) {
            recordings[index] = { ...recordings[index], ...updates, updatedAt: new Date().toISOString() };
            localStorage.setItem('recordings', JSON.stringify(recordings));
            return recordings[index];
        }
        return null;
    },

    deleteRecording(id) {
        const recordings = this.getAllRecordings();
        const filtered = recordings.filter(r => r.id !== id);
        localStorage.setItem('recordings', JSON.stringify(filtered));
        
        // Also delete from IndexedDB
        this.deleteAudioFile(id);
        this.deleteSpectrogram(id);
    },

    async deleteAudioFile(id) {
        const db = await this.initDB();
        const transaction = db.transaction(['audioFiles'], 'readwrite');
        const store = transaction.objectStore('audioFiles');
        store.delete(id);
    },

    async deleteSpectrogram(id) {
        const db = await this.initDB();
        const transaction = db.transaction(['spectrograms'], 'readwrite');
        const store = transaction.objectStore('spectrograms');
        store.delete(id);
    },

    generateId() {
        return 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Export data as JSON
    exportData() {
        const recordings = this.getAllRecordings();
        const dataStr = JSON.stringify(recordings, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bioacoustics_export_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    },

    // Import data from JSON
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            if (Array.isArray(data)) {
                localStorage.setItem('recordings', JSON.stringify(data));
                return true;
            }
        } catch (e) {
            console.error('Import failed:', e);
        }
        return false;
    },

    // Search recordings
    searchRecordings(query) {
        const recordings = this.getAllRecordings();
        const lowerQuery = query.toLowerCase();
        return recordings.filter(r => 
            (r.title && r.title.toLowerCase().includes(lowerQuery)) ||
            (r.species && r.species.toLowerCase().includes(lowerQuery)) ||
            (r.location && r.location.toLowerCase().includes(lowerQuery)) ||
            (r.description && r.description.toLowerCase().includes(lowerQuery))
        );
    },

    // Get recordings without geolocation
    getUngeolocatedRecordings() {
        const recordings = this.getAllRecordings();
        return recordings.filter(r => !r.latitude || !r.longitude);
    }
};

// Helper function to read file as data URL
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Helper function to get audio duration
function getAudioDuration(file) {
    return new Promise((resolve) => {
        const audio = new Audio();
        audio.onloadedmetadata = () => {
            resolve(Math.round(audio.duration));
        };
        audio.onerror = () => resolve(null);
        audio.src = URL.createObjectURL(file);
    });
}
