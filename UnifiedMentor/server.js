const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8081 });



let rooms = {}; // Object to hold rooms and their users

wss.on('connection', (ws) => {
    console.log('New client connected');

    ws.on('message', (data) => {
        const message = JSON.parse(data);

        switch (message.type) {
            case 'getRooms':
                ws.send(JSON.stringify({ type: 'rooms', rooms: Object.keys(rooms) }));
                break;

            case 'createRoom':
                if (!rooms[message.room]) {
                    rooms[message.room] = [];
                    broadcastRooms();
                }
                break;

            case 'joinRoom':
                ws.room = message.room;
                break;

            case 'sendMessage':
                broadcastMessage(message.message);
                break;
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
    });
});

function broadcastRooms() {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify({ type: 'rooms', rooms: Object.keys(rooms) }));
        }
    });
}

function broadcastMessage(message) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN && client.room === message.room) {
            client.send(JSON.stringify({ type: 'message', message }));
        }
    });
}

console.log('WebSocket server is running on ws://localhost:8080');
