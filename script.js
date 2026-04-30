// ===== Identity =====
let username = localStorage.getItem("chatName");
let userId = localStorage.getItem("chatId");

if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("chatId", userId);
}

if (!username) setUsername();

// ===== System =====
const chatBox = document.getElementById("chat");
const roomSelect = document.getElementById("room");
const input = document.getElementById("msgInput");
const channel = new BroadcastChannel("chat_app");

// ===== Username =====
function setUsername() {
  const name = prompt("Enter username:");
  username = (name && name.trim()) ? name.trim() : "Guest";
  localStorage.setItem("chatName", username);
}

function changeUsername() {
  setUsername();
}

// ===== Color system (deterministic per userId) =====
function colorFromId(id) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return `hsl(${hash % 360}, 70%, 60%)`;
}

// ===== Storage =====
function getMessages(room) {
  return JSON.parse(localStorage.getItem(room) || "[]");
}

function saveMessages(room, msgs) {
  localStorage.setItem(room, JSON.stringify(msgs));
}

// ===== Render =====
function loadMessages(room) {
  chatBox.innerHTML = "";
  const msgs = getMessages(room);

  msgs.forEach(m => {
    const div = document.createElement("div");
    div.className = "msg";

    const color = colorFromId(m.userId);

    div.innerHTML = `
      <span class="user" style="color:${color}">
        ${m.user}
      </span>: ${m.text}
    `;

    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

// ===== Send =====
function sendMsg() {
  const text = input.value.trim();
  if (!text) return;

  const room = roomSelect.value;

  const msg = {
    user,
    userId,
    text,
    time: Date.now()
  };

  const msgs = getMessages(room);
  msgs.push(msg);
  saveMessages(room, msgs);

  channel.postMessage({ room, msg });

  input.value = "";
  loadMessages(room);
}

// ===== Clear room =====
function clearRoom() {
  const room = roomSelect.value;
  localStorage.removeItem(room);
  loadMessages(room);
}

// ===== Sync (NO DUPLICATES FIXED) =====
channel.onmessage = (event) => {
  const { room, msg } = event.data;

  const msgs = getMessages(room);

  const exists = msgs.some(m =>
    m.userId === msg.userId &&
    m.text === msg.text &&
    m.time === msg.time
  );

  if (!exists) {
    msgs.push(msg);
    saveMessages(room, msgs);
  }

  if (room === roomSelect.value) {
    loadMessages(room);
  }
};

// ===== Room switching =====
roomSelect.addEventListener("change", () => {
  loadMessages(roomSelect.value);
});

// ===== Enter key =====
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMsg();
});

// ===== Status indicator =====
window.addEventListener("focus", () => {
  document.getElementById("status").textContent = "● Online";
});

window.addEventListener("blur", () => {
  document.getElementById("status").textContent = "● Away";
});

// ===== Init =====
loadMessages("general");
