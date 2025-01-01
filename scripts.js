document.getElementById('start-chat-btn').addEventListener('click', startChat);
document.getElementById('skip-btn').addEventListener('click', skipChat);
document.getElementById('end-chat-btn').addEventListener('click', endChat);
document.getElementById('send-btn').addEventListener('click', sendMessage);

let localStream;
let remoteStream;
let peerConnection;
let dataChannel;

const userVideo = document.getElementById('user-video');
const strangerVideo = document.getElementById('stranger-video');
const chatContainer = document.getElementById('chat-container');
const startContainer = document.getElementById('start-container');
const messageBox = document.getElementById('message-box');

// Start chat button click
async function startChat() {
    startContainer.classList.add('hidden');
    chatContainer.classList.remove('hidden');

    try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        userVideo.srcObject = localStream;

        // Set up peer-to-peer connection
        peerConnection = new RTCPeerConnection();
        dataChannel = peerConnection.createDataChannel("chat");

        localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

        peerConnection.onicecandidate = event => {
            if (event.candidate) {
                // Send candidates to the other peer (signaling not implemented here)
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

// Skip chat (next match)
function skipChat() {
    // Logic for skipping to the next random match
    alert('You have skipped the current chat!');
    // Reset streams and restart the connection process
}

// End the chat
function endChat() {
    // Close connection and stop streams
    peerConnection.close();
    localStream.getTracks().forEach(track => track.stop());
    remoteStream.getTracks().forEach(track => track.stop());
    chatContainer.classList.add('hidden');
    startContainer.classList.remove('hidden');
}

// Send message (future feature)
function sendMessage() {
    const message = messageBox.value;
    if (message) {
        console.log('Sent message:', message); // Implement message sending logic
        messageBox.value = ''; // Clear input
    }
}
