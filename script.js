document.addEventListener("DOMContentLoaded", () => {

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

  function changeName() {
    const n = prompt("New name:", username);
    if (n && n.trim()) {
      username = n.trim();
      localStorage.setItem("chatName", username);
    }
  }

  // ---------------- STATE ----------------
  let currentRoom = "general";
  const unread = { general: 0, school: 0 };

  // ---------------- UI ELEMENTS ----------------
  const chat = document.getElementById("chat");
  const input = document.getElementById("messageInput");

  // ---------------- ROOM SWITCH ----------------
  function switchRoom(room) {
    currentRoom = room;
    chat.innerHTML = "";
    listenMessages();
  }

  // ---------------- SEND ----------------
  function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    const ref = db.ref("messages/" + currentRoom).push();

    ref.set({
      id: ref.key,
      user: username,
      userId,
      text,
      time: Date.now()
    });

    input.value = "";
  }

  // ---------------- LISTEN MESSAGES ----------------
  function listenMessages() {

    db.ref("messages/" + currentRoom).off();

    db.ref("messages/" + currentRoom).on("child_added", snap => {
      const msg = snap.val();

      const div = document.createElement("div");
      div.className = "msg";
      if (msg.userId === userId) div.classList.add("own");

      div.innerHTML = `<b>${msg.user}</b><div>${msg.text}</div>`;

      chat.appendChild(div);
      chat.scrollTop = chat.scrollHeight;

      if (currentRoom !== "general") {
        unread[currentRoom]++;
      }
    });
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

  db.ref("onlineUsers").on("value", snap => {
    let out = "";
    snap.forEach(u => out += u.val().name + "<br>");
    document.getElementById("users").innerHTML = out;
  });

  // ---------------- EVENTS (IMPORTANT FIX) ----------------
  document.getElementById("sendBtn").onclick = sendMessage;
  document.getElementById("btnGeneral").onclick = () => switchRoom("general");
  document.getElementById("btnSchool").onclick = () => switchRoom("school");
  document.getElementById("btnName").onclick = changeName;

  input.addEventListener("keydown", e => {
    if (e.key === "Enter") sendMessage();
  });

  // ---------------- START ----------------
  listenMessages();

});
