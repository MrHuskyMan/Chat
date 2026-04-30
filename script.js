// ===== Identity =====
let username = localStorage.getItem("chatName");

function setUsername() {
  const name = prompt("Enter username:");
  username = (name && name.trim()) ? name.trim() : "Guest";
  localStorage.setItem("chatName", username);
}

// ensure username exists
if (!username) setUsername();

// ===== Elements =====
const chatBox = document.getElementById("chat");
const roomSelect = document.getElementById("room");
const input = document.getElementById("msgInput");
const channel = new BroadcastChannel("chat_app");

// ===== Storage =====
function getMsgs(room) {
  return JSON.parse(localStorage.getItem(room) || "[]");
}

function saveMsgs(room, msgs) {
  localStorage.setItem(room, JSON.stringify(msgs));
}

// ===== Render =====
function load(room) {
  chatBox.innerHTML = "";
  const msgs = getMsgs(room);

  msgs.forEach(m => {
    const div = document.createElement("div");
    div.innerHTML = `<b>${m.user}:</b> ${m.text}`;
    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

// ===== Send (GLOBAL FUNCTION FIXED) =====
function sendMsg() {
  const text = input.value.trim();
  if (!text) return;

  const room = roomSelect.value;

  const msg = {
    user: username,
    text,
    time: Date.now()
  };

  const msgs = getMsgs(room);
  msgs.push(msg);
  saveMsgs(room, msgs);

  channel.postMessage({ room, msg });

  input.value = "";
  load(room);
}

// expose to HTML onclick
window.sendMsg = sendMsg;

// ===== Username change (GLOBAL FIX) =====
function changeUsername() {
  setUsername();
  load(roomSelect.value);
}
window.changeUsername = changeUsername;

// ===== Sync (no duplicates) =====
channel.onmessage = (e) => {
  const { room, msg } = e.data;

  const msgs = getMsgs(room);

  const exists = msgs.some(m =>
    m.time === msg.time &&
    m.user === msg.user &&
    m.text === msg.text
  );

  if (!exists) {
    msgs.push(msg);
    saveMsgs(room, msgs);
  }

  if (room === roomSelect.value) load(room);
};

// ===== Room switch =====
roomSelect.addEventListener("change", () => {
  load(roomSelect.value);
});

// ===== Enter key =====
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendMsg();
});

// ===== Init =====
load("general");
