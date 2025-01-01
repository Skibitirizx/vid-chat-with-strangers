const socket = io();

// DOM Elements
const startBtn = document.getElementById('startBtn');
const skipBtn = document.getElementById('skipBtn');
const reportBtn = document.getElementById('reportBtn');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatBox = document.getElementById('chatBox');
const myVideo = document.getElementById('myVideo');
const peerVideo = document.getElementById('peerVideo');

// WebRTC Setup
let localStream;
let peerConnection;
let remoteStream;

// Prompt for camera and microphone permissions when the page loads
async function requestMediaPermissions() {
    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        myVideo.srcObject = localStream;
        startBtn.disabled = false;  // Enable the "Start" button after permissions are granted
    } catch (err) {
        console.error('Error accessing media devices.', err);
        alert('Please allow access to the camera and microphone to continue.');
    }
}

requestMediaPermissions();  // Request permissions on page load

// Handle start button click
startBtn.addEventListener('click', startVideoCall);

async function startVideoCall() {
    try {
        // Create peer connection
        peerConnection = new RTCPeerConnection();

        // Add the local stream to the peer connection
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // Handle incoming tracks from the peer (remote stream)
        peerConnection.ontrack = event => {
            remoteStream = event.streams[0];
            peerVideo.srcObject = remoteStream;  // Display remote stream (right square)
        };

        // Create an offer and send it to the peer (simulating peer connection)
        await simulatePeerConnection();

        // Show the skip and report buttons
        skipBtn.style.display = 'inline-block';
        reportBtn.style.display = 'inline-block';
    } catch (err) {
        console.error('Error during video call setup.', err);
    }
}

// Simulate connecting with another user (this would normally be handled by signaling via Socket.io)
async function simulatePeerConnection() {
    // Send offer to peer
    socket.emit('offer', {}, 'target-user-id');
}

// Skip the user (disconnect)
skipBtn.addEventListener('click', () => {
    socket.emit('skip');
    resetVideoCall();
});

// Report user for inappropriate behavior
reportBtn.addEventListener('click', () => {
    socket.emit('report', 'target-user-id');
    resetVideoCall();
});

// Reset the video call
function resetVideoCall() {
    myVideo.srcObject = null;
    peerVideo.srcObject = null;
    localStream?.getTracks().forEach(track => track.stop());
    peerConnection?.close();
    skipBtn.style.display = 'none';
    reportBtn.style.display = 'none';
}

// Send text messages
sendBtn.addEventListener('click', () => {
    const message = messageInput.value;
    if (message.trim()) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';
        messageDiv.textContent = message;
        chatBox.appendChild(messageDiv);
        messageInput.value = '';
    }
});
