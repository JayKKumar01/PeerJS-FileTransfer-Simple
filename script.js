// Peer setup
const peerBranch = "JayKKumar01-";
const randomId = Math.floor(100000 + Math.random() * 900000);
const peerId = `${peerBranch}${randomId}`;
const peer = new Peer(peerId);

// DOM elements
const logsTextarea = document.getElementById('logs');
const targetPeerIdInput = document.getElementById('targetPeerId');
const transferContainer = document.getElementById('transfer-container');
const roomContainer = document.getElementById('room-container');

// File input (global)
const fileInput = document.getElementById('fileInput');

// Connection variable
let conn;

// Event listener when DOM content is loaded
document.addEventListener('DOMContentLoaded', () => {
    appendLog(`My ID is: ${randomId}`);
});

// Peer event handlers
peer.on('open', () => {
    appendLog(`Connected!`);
});

peer.on('connection', (connection) => {
    setupConnection(connection);
});

// Connect function
function connect() {
    const targetPeerId = targetPeerIdInput.value.trim();

    if (targetPeerId !== '') {
        conn = peer.connect(peerBranch + targetPeerId);
        conn.on('open', () => {
            handleConnectionOpen(targetPeerId);
        });

        conn.on('data', handleData);
    }
}

// Log function
function appendLog(log) {
    logsTextarea.value += log + '\n';
    logsTextarea.scrollTop = logsTextarea.scrollHeight;
}

// Display file transfer window
function showFileTransferWindow() {
    appendLog("Transfer Window Active");
    transferContainer.style.display = 'block';
    roomContainer.classList.add('connected');
}

// Setup event handlers for a new connection
function setupConnection(connection) {
    conn = connection;
    const remoteId = conn.peer.replace(peerBranch, '');
    appendLog(`Connected to ${remoteId}`);

    conn.on('data', handleData);

    showFileTransferWindow();

    conn.on('error', (err) => {
        appendLog('Connection error:', err);
    });
}

// Handle the opening of a connection
function handleConnectionOpen(targetPeerId) {
    appendLog(`Connected to ${targetPeerId}`);
    targetPeerIdInput.value = '';
    showFileTransferWindow();
}

// Handle incoming or outgoing data
function handleData(data) {
    if (data.type === 'file') {
        handleFileData(data);
    } else {
        // Handle other types of data
        // Add your logic here for handling different types of messages
    }
}

// Handle file data
function handleFileData(data) {
    const fileName = data.name;
    const fileData = new Uint8Array(data.data);

    // You can handle the file data as needed
    // For example, you may want to display a download link or save the file
    appendLog(`Received file: ${fileName}`);
    downloadFile(fileName, fileData);
}

// Function to download a file
function downloadFile(fileName, fileData) {
    const blob = new Blob([fileData], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
}

// Function to send a file
function sendFile() {
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];

        // Use a FileReader to read the file content
        const reader = new FileReader();

        reader.onload = function (event) {
            const fileData = event.target.result;

            // Send the file data to the connected peer
            conn.send({ type: 'file', data: fileData, name: file.name });

            // Update the UI or log that the file is being sent
            appendLog(`Sending file: ${file.name}`);
        };

        // Read the file as an ArrayBuffer
        reader.readAsArrayBuffer(file);
    } else {
        appendLog('Please select a file to send.');
    }
}
