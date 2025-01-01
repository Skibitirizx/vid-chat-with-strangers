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

                client1.send(JSON.stringify({ action: 'start', offer: 'offer-details' }));
                client2.send(JSON.stringify({ action: 'start', offer: 'offer-details' }));
            }
        }

        if (data.action === 'offer') {
            // Handle offer and send response
        }

        if (data.action === 'candidate') {
            // Handle ICE candidates
        }

        if (data.action === 'skip') {
            // Handle skipping and re-queueing users
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected.');
        // Remove client from waiting queue
    });
});

console.log('Signaling server running on ws://localhost:3000');
