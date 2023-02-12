var socket = null;
var hostUrl = null;

function init() {
  hostUrl = "http://localhost:5001";

  console.log("Initializing client...");
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

function admConnect() {
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

    socket.send({ room: "admin" });
  } catch (error) {
    console.log(error);
  }

  socket.on("message", function (data) {
    console.log("Admin Client received: " + data);

    if (data.numberOfClients) {
      var p = document.getElementById("numberOfClients");
      p.style.display = "block";
      p.innerHTML = "Number of connected clients: " + data.numberOfClients;
    }
  });
}
// Povezivanje klijenta na wss
function connect() {
  console.log("Connecting client...");

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
  } catch (error) {
    console.log(error);
  }

  socket.on("connect", function () {
    console.log("Client connected!");

    // console.log(socket);
  });

  socket.on("message", function (data) {
    console.log("Client received: " + data);
  });
}

function isConnected() {
  console.log("\n");
  console.log("Checking if client is connected...");
  console.log(socket);
  if (socket == null) {
    console.log("Client is not connected!");
    return false;
  }
  console.log("Client is connected!\n");
  return socket.connected;
}
