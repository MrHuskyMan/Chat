// ===== Username System =====
let username = localStorage.getItem("chatName");

function setUsername() {
  const input = prompt("Enter a username:");
  if (input && input.trim().length > 0) {
    username = input.trim();
    localStorage.setItem("chatName", username);
  } else {
    username = "Guest";
    localStorage.setItem("chatName", username);
  }
}

// If no username exists, ask once
if (!username) {
  setUsername();
}

// ===== Setup =====
const chatBox = document.getElementById("chat");
const roomSelect = document.getElementById("room");
const input = document.getElementById("msgInput");

// BroadcastChannel (sync between tabs)
channel.onmessage = (event) => {
  const { room, msg } = event.data;

  // ONLY add if it doesn't already exist
  const msgs = JSON.parse(localStorage.getItem(room) || "[]");

  const alreadyExists = msgs.some(m =>
    m.user === msg.user &&
    m.text === msg.text &&
    m.time === msg.time
  );

  if (!alreadyExists) {
    msgs.push(msg);
    localStorage.setItem(room, JSON.stringify(msgs));
  }

  if (room === roomSelect.value) {
    loadMessages(room);
  }
};

// Load messages
function loadMessages(room) {
  chatBox.innerHTML = "";
  const msgs = JSON.parse(localStorage.getItem(room) || "[]");

  msgs.forEach(m => {
    const div = document.createElement("div");
    div.className = "msg";
    div.innerHTML = `<span class="user">${m.user}:</span> ${m.text}`;
    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

// Save message
function saveMessage(room, msg) {
  const msgs = JSON.parse(localStorage.getItem(room) || "[]");
  msgs.push(msg);
  localStorage.setItem(room, JSON.stringify(msgs));
}

// Send message
function sendMsg() {
  const text = input.value.trim();
  if (!text) return;

  const room = roomSelect.value;

  const msg = {
    user: username,
    text: text,
    time: Date.now()
  };

  saveMessage(room, msg);
  channel.postMessage({ room, msg });

  input.value = "";
  loadMessages(room);
}

// Room switching
roomSelect.addEventListener("change", () => {
  loadMessages(roomSelect.value);
});

// Receive messages from other tabs
channel.onmessage = (event) => {
  const { room, msg } = event.data;
  saveMessage(room, msg);

  if (room === roomSelect.value) {
    loadMessages(room);
  }
};

// Enter key send
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMsg();
});

// Initial load
loadMessages("general");
