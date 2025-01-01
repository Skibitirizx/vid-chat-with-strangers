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

// Turn on the video chat when "Start" is clicked
startBtn.addEventListener('click', startVideoCall);

async function startVideoCall() {
    try {
        // Request camera and microphone
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        myVideo.srcObject = localStream;

        // Create peer connection
        peerConnection = new RTCPeerConnection();
        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        // Get remote stream and display it
        peerConnection.ontrack = event => {
            remoteStream = event.streams[0];
            peerVideo.srcObject = remoteStream;
        };

        // Connect to another user (simulating)
        await simulatePeerConnection();

        // Show the skip and report buttons
        skipBtn.style.display = 'inline-block';
        reportBtn.style.display = 'inline-block';
    } catch (err) {
        console.error('Error accessing media devices.', err);
    }
}

// Simulate connecting with another user using Socket.io signaling
async function simulatePeerConnection() {
    // Send offer
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

// Reset video call
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
