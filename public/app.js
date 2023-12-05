const socket = io('ws://localhost:3500');
const msgInput = document.querySelector('#message');
const nameInput = document.querySelector('#name');
const chatRoom = document.querySelector('#room');
const activity = document.querySelector('.activity');
const usersList = document.querySelector('.user-list');
const roomList = document.querySelector('.room-list');
const chatDisplay = document.querySelector('.chat-display');

// Function to handle sending messages
function sendMessage(e) {
    e.preventDefault();
    if (nameInput.value && msgInput.value && chatRoom.value) {
        socket.emit('message', {
            name: nameInput.value,
            text: msgInput.value
        });
        msgInput.value = '';
    }
    msgInput.focus();
}

// Function to handle entering a chat room
function enterRoom(e) {
    e.preventDefault();
    if (nameInput.value && chatRoom.value) {
        socket.emit('enterRoom', {
            name: nameInput.value,
            room: chatRoom.value
        });
    }
}

// Event listeners for message sending and room entering
document.querySelector('.form-msg').addEventListener('submit', sendMessage);
document.querySelector('.form-join').addEventListener('submit', enterRoom);

// Emitting activity when typing
msgInput.addEventListener('keypress', () => {
    socket.emit('activity', nameInput.value);
});

// Listen for incoming messages
socket.on("message", (data) => {
    activity.textContent = '';
    const { name, text, time } = data;
    const li = document.createElement('li');
    li.className = 'post';
    li.classList.add(name === nameInput.value ? 'post--left' : 'post--right');
    li.innerHTML = `<div class="post__header ${name === nameInput.value ? 'post__header--user' : 'post__header--reply'}">
            <span class="post__header--name">${name}</span> 
            <span class="post__header--time">${time}</span> 
        </div>
        <div class="post__text">${text}</div>`;
    chatDisplay.appendChild(li);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
});

// Handle typing activity
let activityTimer;
socket.on("activity", (name) => {
    activity.textContent = `${name} is typing...`;
    clearTimeout(activityTimer);
    activityTimer = setTimeout(() => {
        activity.textContent = '';
    }, 3000);
});

// Display the list of users in the room
socket.on('userList', ({ users }) => {
    showUsers(users);
});

// Display the list of active rooms
socket.on('roomList', ({ rooms }) => {
    showRooms(rooms);
});

function showUsers(users) {
    usersList.textContent = '';
    if (users) {
        usersList.innerHTML = `<em>Users in ${chatRoom.value}:</em>`;
        users.forEach((user, i) => {
            usersList.textContent += ` ${user.name}`;
            if (users.length > 1 && i !== users.length - 1) {
                usersList.textContent += ",";
            }
        });
    }
}

function showRooms(rooms) {
    roomList.textContent = '';
    if (rooms) {
        roomList.innerHTML = '<em>Active Rooms:</em>';
        rooms.forEach((room, i) => {
            roomList.textContent += ` ${room}`;
            if (rooms.length > 1 && i !== rooms.length - 1) {
                roomList.textContent += ",";
            }
        });
    }
}