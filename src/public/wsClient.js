var socket = null;
var hostUrl = null;

function init() {
  hostUrl = "http://localhost:5001";

  console.log("Initializing client...");
  connect();
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

function admSendStream() {
  console.log("Sending stream to admin...");

  if (!isConnected()) {
    console.log("Client is not connected!");
    return;
  }

  socket.emit("stream", "This is some stream data!");
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

    socket.emit("joinRoom", { room: "user" });
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
  });

  socket.on("message", function (data) {
    console.log("Client received: " + data);

    const img = document.querySelector("img");
    img.src = data;
  });

  // socket.on("stream", function (data) {
  //   console.log("Stream received: " + data);
  // });
}

function isConnected() {
  console.log("Checking if client is connected...");
  if (socket == null) {
    console.log("Client is not connected!");
    return false;
  }
  console.log("Client is connected!\n");
  return socket.connected;
}
