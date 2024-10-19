const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const joinChatBtn = document.getElementById('join-chat-btn');
const roomsList = document.getElementById('rooms');
const newRoomInput = document.getElementById('new-room-input');
const createRoomBtn = document.getElementById('create-room-btn');
const messageInput = document.getElementById('message-input');
const sendMessageBtn = document.getElementById('send-message-btn');
const messagesContainer = document.getElementById('messages-container');
const currentRoomDisplay = document.getElementById('current-room');

let socket;
let username;
let currentRoom;

// Handle login
joinChatBtn.addEventListener('click', () => {
    username = usernameInput.value.trim();
    if (username) {
        loginScreen.style.display = 'none';
        chatScreen.style.display = 'block';
        initializeWebSocket();
    }
});

function initializeWebSocket() {
    // Connect to WebSocket server
    socket = new WebSocket('ws://localhost:8080'); // Change the URL if using a hosted WebSocket service

    socket.onopen = () => {
        console.log('Connected to WebSocket');
        fetchRooms();
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'rooms') {
            updateRoomsList(data.rooms);
        } else if (data.type === 'message') {
            displayMessage(data.message);
        }
    };

    socket.onerror = (error) => {
        console.log('WebSocket error:', error);
    };
}

function fetchRooms() {
    socket.send(JSON.stringify({ type: 'getRooms' }));
}

function updateRoomsList(rooms) {
    roomsList.innerHTML = '';
    rooms.forEach(room => {
        const li = document.createElement('li');
        li.textContent = room;
        li.addEventListener('click', () => joinRoom(room));
        roomsList.appendChild(li);
    });
}

function joinRoom(room) {
    currentRoom = room;
    currentRoomDisplay.textContent = `Room: ${room}`;
    socket.send(JSON.stringify({ type: 'joinRoom', room }));
    messagesContainer.innerHTML = ''; // Clear chat window
}

createRoomBtn.addEventListener('click', () => {
    const newRoom = newRoomInput.value.trim();
    if (newRoom) {
        socket.send(JSON.stringify({ type: 'createRoom', room: newRoom }));
        newRoomInput.value = ''; // Clear input field
    }
});

sendMessageBtn.addEventListener('click', () => {
    const message = messageInput.value.trim();
    if (message && currentRoom) {
        const formattedMessage = {
            username,
            room: currentRoom,
            text: message,
            timestamp: new Date().toLocaleTimeString()
        };
        socket.send(JSON.stringify({ type: 'sendMessage', message: formattedMessage }));
        displayMessage(formattedMessage);
        messageInput.value = ''; // Clear input field
    }
});

function displayMessage(message) {
    const div = document.createElement('div');
    div.classList.add('message');
    div.innerHTML = `<span class="username">${message.username}</span>:
                     <span>${message.text}</span>
                     <span class="timestamp">${message.timestamp}</span>`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Auto scroll to bottom
}
