// ---------------- FIREBASE ----------------
const firebaseConfig = {
  apiKey: "AIzaSyDbgXEyQCcb9EzWf2JDI25V29VyfSQ7Tdg",
  authDomain: "chat-4dbb4.firebaseapp.com",
  projectId: "chat-4dbb4",
  storageBucket: "chat-4dbb4.firebasestorage.app",
  messagingSenderId: "109228240521",
  appId: "1:109228240521:web:907ed25d4f179e7a032058",
  databaseURL: "https://chat-4dbb4-default-rtdb.firebaseio.com/"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// ---------------- USER ----------------
let username = localStorage.getItem("chatName");
if (!username) {
  username = prompt("Enter username:");
  if (!username) username = "Guest";
  localStorage.setItem("chatName", username);
}

let userId = localStorage.getItem("chatId");
if (!userId) {
  userId = Math.random().toString(36).substring(2, 10);
  localStorage.setItem("chatId", userId);
}

function changeUsername() {
  const n = prompt("New name:", username);
  if (n && n.trim()) {
    username = n.trim();
    localStorage.setItem("chatName", username);
  }
}

// ---------------- ROOMS ----------------
let currentRoom = "general";
let lastSeenRoom = "general";
const unread = { general: 0, school: 0 };
const userColors = {};

function switchRoom(room) {
  currentRoom = room;
  lastSeenRoom = room;
  unread[room] = 0;
  document.getElementById("chat").innerHTML = "";
  listenMessages();
}

// ---------------- COLORS ----------------
function getColor(id) {
  if (userColors[id]) return userColors[id];
  const colors = ["#00a8ff","#ff6b6b","#1dd1a1","#feca57","#a29bfe"];
  userColors[id] = colors[Math.floor(Math.random()*colors.length)];
  return userColors[id];
}

// ---------------- SEND ----------------
function sendMessage() {
  const input = document.getElementById("messageInput");
  const text = input.value.trim();
  if (!text) return;

  const ref = db.ref("messages/" + currentRoom).push();

  ref.set({
    id: ref.key,
    user: username,
    userId: userId,
    text,
    time: Date.now()
  });

  input.value = "";
}

// ---------------- MESSAGES ----------------
function listenMessages() {
  const chat = document.getElementById("chat");

  db.ref("messages/" + currentRoom).off();

  db.ref("messages/" + currentRoom).on("child_added", snap => {
    const msg = snap.val();

    const div = document.createElement("div");
    div.className = "msg";
    if (msg.userId === userId) div.classList.add("own");

    const color = getColor(msg.userId);
    const time = new Date(msg.time).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});

    div.innerHTML = `
      <b style="color:${color}">${msg.user}</b>
      <span style="font-size:10px;color:#aaa"> ${time}</span>
      <div>${msg.text}</div>
      <div style="font-size:12px;margin-top:4px;">
        <span onclick="react('${msg.id}','👍')">👍</span>
        <span onclick="react('${msg.id}','😂')">😂</span>
        <span onclick="react('${msg.id}','❤️')">❤️</span>
      </div>
    `;

    setTimeout(() => {
      div.style.transition = "0.2s";
      div.style.opacity = 1;
      div.style.transform = "translateY(0)";
    }, 10);

    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;

    if (currentRoom !== lastSeenRoom) {
      unread[currentRoom]++;
    }
  });
}

// ---------------- REACTIONS ----------------
function react(id, emoji) {
  db.ref(`reactions/${currentRoom}/${id}/${userId}`).set(emoji);
}

// ---------------- ONLINE USERS ----------------
function setOnline() {
  db.ref("onlineUsers/" + userId).set({
    name: username,
    time: Date.now()
  });
}

setOnline();
setInterval(setOnline, 5000);
db.ref("onlineUsers/" + userId).onDisconnect().remove();

db.ref("onlineUsers").on("value", snap => {
  let out = "";
  snap.forEach(u => out += u.val().name + "<br>");
  document.getElementById("users").innerHTML = out;
});

// ---------------- TYPING ----------------
const input = document.getElementById("messageInput");
let typingTimeout;

input.addEventListener("input", () => {
  db.ref(`typing/${currentRoom}/${userId}`).set({
    name: username,
    typing: true
  });

  clearTimeout(typingTimeout);
  typingTimeout = setTimeout(() => {
    db.ref(`typing/${currentRoom}/${userId}`).remove();
  }, 1000);
});

db.ref("typing/" + currentRoom).on("value", snap => {
  let users = [];
  snap.forEach(u => {
    const v = u.val();
    if (v.name !== username) users.push(v.name);
  });

  document.getElementById("typing").innerText =
    users.length ? users.join(", ") + " is typing..." : "";
});

// ---------------- UNREAD UI ----------------
setInterval(() => {
  document.getElementById("unread-general").innerText =
    unread.general ? `(${unread.general})` : "";

  document.getElementById("unread-school").innerText =
    unread.school ? `(${unread.school})` : "";
}, 500);

// ---------------- START ----------------
listenMessages();
