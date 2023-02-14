var socket = null;
var hostUrl = null;

var clientMap = new Map();

function init() {
  hostUrl = "http://localhost:5001";

  connect();
}

function isConnected() {
  return socket !== null;
}

function requestRoom() {
  socket.emit("joinRoom", { room: "admin" });
}

function disconnect() {
  console.log("Disconnecting client...");

  if (!isConnected()) {
    return;
  }

  socket.disconnect();
  socket = null;

  console.log("Client disconnected!");
}

function connect() {
  if (isConnected()) {
    console.log("Client is already connected!");
    return;
  }

  try {
    socket = io.connect(hostUrl, {
      transports: ["websocket"],
      cors: {
        origin: hostUrl,
        methods: ["GET", "POST"],
      },
    });

    requestRoom();

    setTimeout(() => {
      requestClientList();
    }, 1000);

    // setInterval(() => {
    //   requestClientList();
    // }, 10000);
  } catch (error) {
    console.log(error);
  }

  socket.on("userJoined", (data) => {
    for (var key in data) {
      clientMap.set(key, data[key]);
    }

    updateFront(clientMap);
  });

  socket.on("userLeft", (socketId) => {
    clientMap.delete(socketId);

    updateFront(clientMap);
  });

  socket.on("message", (data) => {
    console.log("message");
    console.log(data);
  });
}

function kickUser(socketId) {
  if (confirm("Are you sure you want to kick this user?") == false) {
    return;
  }

  socket.emit("kickUser", socketId);
}

function requestClientList() {
  socket.emit("requestClientList");
}
