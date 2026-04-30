document.addEventListener("DOMContentLoaded", () => {

  // -------- DEBUG (VISIBLE ON SCREEN) --------
  const debugBox = document.getElementById("debug");
  function debug(msg) {
    if (debugBox) {
      debugBox.innerText += "\n" + msg;
    }
  }

  debug("✅ Script started");

  // -------- FIREBASE INIT --------
  const firebaseConfig = {
    apiKey: "AIzaSyDbgXEyQCcb9EzWf2JDI25V29VyfSQ7Tdg",
    authDomain: "chat-4dbb4.firebaseapp.com",
    databaseURL: "https://chat-4dbb4-default-rtdb.firebaseio.com/",
    projectId: "chat-4dbb4",
    storageBucket: "chat-4dbb4.firebasestorage.app",
    messagingSenderId: "109228240521",
    appId: "1:109228240521:web:907ed25d4f179e7a032058"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.database();

  debug("🔥 Firebase initialized");

  // -------- USER SETUP --------
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

  debug("👤 User: " + username);

  // -------- STATE --------
  let currentRoom = "general";

  const chat = document.getElementById("chat");
  const input = document.getElementById("messageInput");

  // -------- SEND MESSAGE --------
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    const ref = db.ref("messages/" + currentRoom).push();

    ref.set({
      user: username,
      userId: userId,
      text: text,
      time: Date.now()
    });

    input.value = "";
  }

  // -------- LISTEN MESSAGES --------
  function listenMessages() {
    debug("👂 Listening to: messages/" + currentRoom);

    const ref = db.ref("messages/" + currentRoom);

    ref.off();

    chat.innerHTML = "";

    ref.on("child_added", (snap) => {
      const msg = snap.val();

      debug("📩 " + msg.user + ": " + msg.text);

      const div = document.createElement("div");
      div.className = "msg";

      if (msg.userId === userId) {
        div.classList.add("own");
      }

      div.innerHTML = `<b>${msg.user}</b><br>${msg.text}`;

      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;
    });
  }

  // -------- ROOM SWITCH --------
  function switchRoom(room) {
    currentRoom = room;
    debug("🔁 Switched to: " + room);
    listenMessages();
  }

  // -------- ONLINE USERS --------
  function setOnline() {
    db.ref("onlineUsers/" + userId).set({
      name: username,
      time: Date.now()
    });
  }

  setOnline();
  setInterval(setOnline, 5000);

  db.ref("onlineUsers").on("value", (snap) => {
    let out = "";
    snap.forEach(u => {
      out += u.val().name + "<br>";
    });
    document.getElementById("users").innerHTML = out;
  });

  // -------- BUTTONS --------
  document.getElementById("sendBtn").onclick = sendMessage;

  document.getElementById("btnGeneral").onclick = () => switchRoom("general");
  document.getElementById("btnSchool").onclick = () => switchRoom("school");

  document.getElementById("btnName").onclick = () => {
    const n = prompt("New name:", username);
    if (n && n.trim()) {
      username = n.trim();
      localStorage.setItem("chatName", username);
      debug("✏️ Name changed to: " + username);
    }
  };

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });

  // -------- START --------
  listenMessages();

});
