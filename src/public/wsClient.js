var socket = null;
var hostUrl = null;

function init() {
  hostUrl = "http://localhost:5001";

  console.log("Initializing client...");
}

function disconnect() {
  console.log("Disconnecting client...");

  if (!isConnected()) {
    console.log("Client is not connected!");
    return;
  }

  socket.disconnect();

  console.log("Client disconnected!");
}

// Povezivanje klijenta na wss
function connect() {
  console.log("Connecting client...");

  socket = io.connect(hostUrl, {
    transports: ["websocket"],
    cors: {
      origin: hostUrl,
      methods: ["GET", "POST"],
    },
  });

  socket.on("connect", function () {
    console.log("Client connected!");

    console.log(socket);
  });
}

function isConnected() {
  if (socket == null) {
    return false;
  }
  return socket.connected;
}
