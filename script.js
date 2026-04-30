body {
  margin: 0;
  font-family: Arial, sans-serif;
  background: #1e1f22;
  color: white;
}

#top {
  display: flex;
  gap: 8px;
  padding: 10px;
  background: #2b2d31;
  border-bottom: 1px solid #111;
}

button {
  background: #40444b;
  color: white;
  border: none;
  padding: 6px 10px;
  border-radius: 6px;
  cursor: pointer;
}

button:hover {
  background: #4e525a;
}

#layout {
  display: flex;
  height: calc(100vh - 50px);
}

#sidebar {
  width: 180px;
  background: #2b2d31;
  padding: 10px;
  border-right: 1px solid #111;
  font-size: 13px;
  color: #bbb;
}

#chatContainer {
  flex: 1;
  display: flex;
  flex-direction: column;
}

#chat {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
}

.msg {
  background: #2b2d31;
  padding: 8px;
  border-radius: 8px;
  margin-bottom: 8px;
  max-width: 70%;
  word-wrap: break-word;
  opacity: 0;
  transform: translateY(5px);
}

.msg.own {
  margin-left: auto;
  background: #3a3d45;
}

#typing {
  font-size: 12px;
  color: #aaa;
  padding: 4px 10px;
}

#inputArea {
  display: flex;
  padding: 10px;
  background: #2b2d31;
  border-top: 1px solid #111;
}

#messageInput {
  flex: 1;
  padding: 10px;
  border: none;
  outline: none;
  background: #40444b;
  color: white;
  border-radius: 6px;
}
