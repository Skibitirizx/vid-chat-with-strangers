document.getElementById('startButton').addEventListener('click', startChat);
document.getElementById('allowButton').addEventListener('click', allowPermissions);
document.getElementById('denyButton').addEventListener('click', denyPermissions);
document.getElementById('chatButton').addEventListener('click', openChatModal);

let localStream;
let remoteStream;
let peerConnection;
let dataChannel;

const userVideo = document.getElementById('userVideo');
const strangerVideo = document.getElementById('strangerVideo');
const startButton = document.getElementById('startButton');
const videoContainer = document.getElementById('videoContainer');
const chatButton = document.getElementById('chatButton');
const permissionContainer = document.getElementById('permissionContainer');
const muteButton = document.getElementById('muteButton');
const stopVideoButton = document.getElementById('stopVideoButton');

// Show permission prompt
function startChat() {
    startButton.classList.add('hidden');
    permissionContainer.classList.remove('hidden');
}

// Allow permissions and start the chat
async function allowPermissions() {
    permissionContainer.classList.add('hidden');
    videoContainer.classList.remove('hidden');
    
    try {
        // Request media access
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        userVideo.srcObject = localStream;

        // Set up peer-to-peer connection
        peerConnection = new RTCPeerConnection();
        dataChannel = peerConnection.createDataChannel("chat");

        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                // Send candidates to the other peer (not implemented in this example)
            }
        };

        // Simulate video connection with the remote peer
        setTimeout(() => {
            remoteStream = localStream; // For simplicity, using the same local stream
            strangerVideo.srcObject = remoteStream;
        }, 2000);

        peerConnection.createOffer().then(offer => {
            peerConnection.setLocalDescription(offer);
        }).catch(err => console.error("Offer creation failed:", err));
    } catch (error) {
        alert("Permission denied or error accessing camera/microphone. You cannot join the chat.");
        console.error('Error accessing media devices:', error);
    }
}

// Deny permissions and alert the user
function denyPermissions() {
    permissionContainer.classList.add('hidden');
    alert("You must allow camera and microphone access to join the chat.");
}

// Open chat modal
function openChatModal() {
    // Add logic to open chat or interact with the user
}

// Mute audio
muteButton.addEventListener('click', () => {
    const isMuted = localStream.getAudioTracks()[0].enabled;
    localStream.getAudioTracks()[0].enabled = !isMuted;
    muteButton.textContent = isMuted ? 'Unmute' : 'Mute';
});

// Stop video
stopVideoButton.addEventListener('click', () => {
    const isVideoStopped = localStream.getVideoTracks()[0].enabled;
    localStream.getVideoTracks()[0].enabled = !isVideoStopped;
    stopVideoButton.textContent = isVideoStopped ? 'Start Video' : 'Stop Video';
});
