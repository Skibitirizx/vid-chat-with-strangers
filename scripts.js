document.getElementById('allow-button').addEventListener('click', allowPermissions);
document.getElementById('start-chat-btn').addEventListener('click', startChat);
document.getElementById('skip-btn').addEventListener('click', skipChat);
document.getElementById('end-chat-btn').addEventListener('click', endChat);

let localStream;
let peerConnection;
let signalingServer;
let remoteStream;

const userVideo = document.getElementById('user-video');
const strangerVideo = document.getElementById('stranger-video');
const permissionContainer = document.getElementById('permission-container');
const chatContainer = document.getElementById('chat-container');
const startContainer = document.getElementById('start-container');

// Force permission for video and audio
function allowPermissions() {
    permissionContainer.classList.add('hidden');
    startContainer.classList.remove('hidden');
}

// Start the chat
async function startChat() {
    startContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        userVideo.srcObject = localStream;

        signalingServer = new WebSocket("ws://localhost:3000"); // Signaling server address
        signalingServer.onopen = () => {
            signalingServer.send(JSON.stringify({ action: 'join' })); // Join the queue
        };

        signalingServer.onmessage = async (message) => {
            const data = JSON.parse(message.data);
            if (data.action === 'start') {
                initiatePeerConnection();
                signalingServer.send(JSON.stringify({ action: 'start', offer: data.offer }));
            }
        };

        signalingServer.onclose = () => {
            console.log("Connection to signaling server closed");
        };

    } catch (error) {
        alert("Permission denied or error accessing camera/microphone. You cannot join the chat.");
    }
}

// WebRTC peer connection setup
function initiatePeerConnection() {
    peerConnection = new RTCPeerConnection();

    // Add local stream tracks to the peer connection
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

    peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
            signalingServer.send(JSON.stringify({ action: 'candidate', candidate: event.candidate }));
        }
    };

    peerConnection.ontrack = (event) => {
        if (event.streams[0]) {
            strangerVideo.srcObject = event.streams[0];
        }
    };

    // Create an offer and send it to the other peer
    peerConnection.createOffer().then((offer) => {
        peerConnection.setLocalDescription(offer);
        signalingServer.send(JSON.stringify({ action: 'offer', offer: offer }));
    }).catch(err => console.error("Offer creation failed:", err));
}

// Skip to the next person
function skipChat() {
    console.log("Skipping chat...");
    // Handle skipping and matching with a new user
}

// End the chat
function endChat() {
    peerConnection.close();
    localStream.getTracks().forEach(track => track.stop());
    chatContainer.classList.add('hidden');
    startContainer.classList.remove('hidden');
}
