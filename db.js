// IndexedDB Setup
const DB_NAME = 'TuersteherRechner';
const DB_VERSION = 1;
let db;

// Initialize Database
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
            db = request.result;
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            const db = event.target.result;

            // Create shifts store
            if (!db.objectStoreNames.contains('shifts')) {
                const shiftsStore = db.createObjectStore('shifts', { keyPath: 'id', autoIncrement: true });
                shiftsStore.createIndex('startTime', 'startTime', { unique: false });
            }

            // Create history store
            if (!db.objectStoreNames.contains('history')) {
                const historyStore = db.createObjectStore('history', { keyPath: 'id', autoIncrement: true });
                historyStore.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

// Shift Operations
async function addShift(shift) {
    const transaction = db.transaction(['shifts'], 'readwrite');
    const store = transaction.objectStore('shifts');
    return new Promise((resolve, reject) => {
        const request = store.add(shift);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllShifts() {
    const transaction = db.transaction(['shifts'], 'readonly');
    const store = transaction.objectStore('shifts');
    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function deleteShift(id) {
    const transaction = db.transaction(['shifts'], 'readwrite');
    const store = transaction.objectStore('shifts');
    return new Promise((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

async function updateShift(id, shift) {
    const transaction = db.transaction(['shifts'], 'readwrite');
    const store = transaction.objectStore('shifts');
    shift.id = id;
    return new Promise((resolve, reject) => {
        const request = store.put(shift);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// History Operations
async function addHistory(entry) {
    const transaction = db.transaction(['history'], 'readwrite');
    const store = transaction.objectStore('history');
    return new Promise((resolve, reject) => {
        const request = store.add(entry);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

async function getAllHistory() {
    const transaction = db.transaction(['history'], 'readonly');
    const store = transaction.objectStore('history');
    const index = store.index('timestamp');
    return new Promise((resolve, reject) => {
        const request = index.getAll();
        request.onsuccess = () => {
            // Sort by timestamp descending (newest first)
            const results = request.result.sort((a, b) => b.timestamp - a.timestamp);
            resolve(results);
        };
        request.onerror = () => reject(request.error);
    });
}

async function clearHistory() {
    const transaction = db.transaction(['history'], 'readwrite');
    const store = transaction.objectStore('history');
    return new Promise((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

// Initialize default shifts if none exist
async function initDefaultShifts() {
    const shifts = await getAllShifts();
    if (shifts.length === 0) {
        // Default shifts as per example in requirements
        await addShift({ startTime: '02:00', endTime: '04:00', rate: 10 });
        await addShift({ startTime: '04:00', endTime: '05:00', rate: 20 });
        await addShift({ startTime: '00:00', endTime: '02:00', rate: 12 });
        await addShift({ startTime: '05:00', endTime: '06:00', rate: 15 });
    }
}
