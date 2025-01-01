const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 3000 });

let waitingClients = [];

wss.on('connection', (ws) => {
    console.log("Client connected.");

    ws.on('message', (message) => {
        const data = JSON.parse(message);

        if (data.action === 'join') {
            waitingClients.push(ws);
            console.log('Client joined the queue.');
            if (waitingClients.length >= 2) {
                // Match two clients
                const client1 = waitingClients.shift();
                const client2 = waitingClients.shift();

                client1.send(JSON.stringify({ action: 'start', offer: null }));
                client2.send(JSON.stringify({ action: 'start', offer: null }));
            }
        }

        if (data.action === 'offer') {
            // Forward the offer to the other client
            const peer = waitingClients.find((client) => client !== ws);
            if (peer) {
                peer.send(JSON.stringify({ action: 'offer', offer: data.offer }));
            }
        }

        if (data.action === 'answer') {
            // Forward the answer to the other client
            const peer = waitingClients.find((client) => client !== ws);
            if (peer) {
                peer.send(JSON.stringify({ action: 'answer', answer: data.answer }));
            }
        }

        if (data.action === 'candidate') {
            // Forward the ICE candidate to the other client
            const peer = waitingClients.find((client) => client !== ws);
            if (peer) {
                peer.send(JSON.stringify({ action: 'candidate', candidate: data.candidate }));
            }
        }

        if (data.action === 'skip') {
            // Remove the client from the queue
            const index = waitingClients.indexOf(ws);
            if (index !== -1) {
                waitingClients.splice(index, 1);
            }
            ws.send(JSON.stringify({ action: 'skip' }));
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        const index = waitingClients.indexOf(ws);
        if (index !== -1) {
            waitingClients.splice(index, 1);
        }
    });
});

console.log('Signaling server running on ws://localhost:3000');
