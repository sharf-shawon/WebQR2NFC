// Permission Management
async function checkPermission(permissionName) {
    try {
        const permission = await navigator.permissions.query({ name: permissionName });
        return permission.state === 'granted';
    } catch (error) {
        console.warn(`Permission check failed for ${permissionName}:`, error);
        return false;
    }
}

async function requestNfcPermission() {
    if ('NDEFReader' in window) {
        try {
            const ndef = new NDEFReader();
            await ndef.scan();
            return true;
        } catch (error) {
            console.warn('NFC permission request failed:', error);
            return false;
        }
    }
    console.warn('NFC is not supported on this device.');
    return false;
}

async function checkAndRequestPermissions() {
    const cameraGranted = await checkPermission('camera');
    if (!cameraGranted) {
        showToast('Camera permission is required to scan QR codes. Please grant camera access.');
    }

    const nfcGranted = await requestNfcPermission();
    if (!'NDEFReader' in window) {
        showToast('Web NFC is not supported on this device. NFC writing will not work.');
    }
    
    if (!nfcGranted) {
        showToast('NFC permission is required to write to NFC tags. Please grant NFC access.');
    }
}

// State Management
const appState = {
    scanning: true,
    writingMode: false,
    cardCounter: Number(localStorage.getItem('cardCounter')) || 0,
    scanHistory: JSON.parse(localStorage.getItem('scanHistory')) || [],
};

function saveAppState() {
    localStorage.setItem('cardCounter', appState.cardCounter);
    localStorage.setItem('scanHistory', JSON.stringify(appState.scanHistory));
}

function updateCounterDisplay() {
    document.getElementById('counter').textContent = appState.cardCounter;
}

function updateHistoryDisplay() {
    const historyTableBody = document.getElementById('historyTableBody');
    historyTableBody.innerHTML = '';
    appState.scanHistory.forEach((url, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `<td>${index + 1}</td><td>${url}</td>`;
        historyTableBody.appendChild(row);
    });
}

// NFC Writing
async function startNfcWritingSession(url) {
    // Handle NFC not supported gracefully
    if (!('NDEFReader' in window)) {
        updateScannerStatus('❌ NFC is not supported on this device.');
    }

    if (!('NDEFReader' in window)) {
        console.warn('NFC is not supported on this device.');
        return;
    }

    try {
        const ndef = new NDEFReader();
        await ndef.scan();

        ndef.onreading = async () => {
            if (!appState.writingMode) return;
            appState.writingMode = false;

            try {
                await ndef.write({ records: [{ recordType: 'url', data: url }] });
                document.body.classList.remove('pulse-red');
                document.getElementById('wait-sound').pause();
                playSound('nfc-sound');
                appState.scanning = true;
                appState.cardCounter++;
                appState.scanHistory.push(url);
                saveAppState();
                updateCounterDisplay();
                updateHistoryDisplay();
                updateScannerStatus('Ready to scan QR');
                showToast('Card written successfully!');
            } catch (error) {
                console.error('NFC write failed:', error);
            }
        };
    } catch (error) {
        console.error('NFC session failed:', error);
    }
}

// QR Code Scanning
// Suppress QR scan errors for better console clarity
function startQrScanner() {
    const html5QrCode = new Html5Qrcode('scanner');

    Html5Qrcode.getCameras()
        .then((cameras) => {
            if (cameras.length) {
                const backCamera = cameras.find((c) => c.label.toLowerCase().includes('back')) || cameras[0];
                html5QrCode.start(
                    { deviceId: { exact: backCamera.id } },
                    { fps: 10, qrbox: { width: 250, height: 250 } }, // Ensure square frame
                    (decodedText) => {
                        updateScannerStatus('QR Scanned! Approach NFC...');
                        handleQrCode(decodedText);
                    },
                    (errorMessage) => {
                        // Suppress specific QR scan errors
                        if (!errorMessage.includes('No barcode or QR code detected') &&
                            !errorMessage.includes('No MultiFormat Readers were able to detect the code')) {
                            console.warn('QR scan error:', errorMessage);
                        }
                    }
                );
                updateScannerStatus('Ready to scan QR');
            } else {
                updateScannerStatus('❌ No cameras found.');
            }
        })
        .catch((error) => {
            updateScannerStatus('❌ Failed to access camera: ' + error.message);
        });
}

function handleQrCode(decodedText) {
    if (!appState.scanning) return;
    appState.scanning = false;

    const scannerEl = document.getElementById('scanner');
    scannerEl.classList.add('pulse-red');
    playSound('wait-sound');
    document.getElementById('qr-content').value = decodedText;

    if (appState.scanHistory.includes(decodedText)) {
        if (confirm('This QR code already exists. Overwrite NFC tag?')) {
            appState.writingMode = true;
            startNfcWritingSession(decodedText);
        } else {
            appState.scanning = true;
            scannerEl.classList.remove('pulse-red');
            document.getElementById('wait-sound').pause();
        }
    } else {
        appState.writingMode = true;
        startNfcWritingSession(decodedText);
    }
}

// Fix reset button functionality
document.getElementById('resetBtn').addEventListener('click', () => {
    appState.cardCounter = 0;
    appState.scanHistory = [];
    saveAppState();
    updateCounterDisplay();
    updateHistoryDisplay();
    document.getElementById('wait-sound').pause();
    document.getElementById('wait-sound').pause();

    showToast('Reset successful!');
});

// Update scanner status dynamically
function updateScannerStatus(message) {
    const statusEl = document.getElementById('status');
    statusEl.textContent = message;
}

// Utility Functions
function playSound(soundId) {
    const sound = document.getElementById(soundId);
    sound.currentTime = 0;
    sound.play();
}

function showToast(message) {
    const toastEl = document.getElementById('toast');
    toastEl.textContent = message;
    toastEl.style.opacity = 1;
    setTimeout(() => (toastEl.style.opacity = 0), 3000);
}

// Initialization
window.addEventListener('load', () => {
    initializeThemeSelector();
    checkAndRequestPermissions();
    updateCounterDisplay();
    updateHistoryDisplay();
    startQrScanner();
});