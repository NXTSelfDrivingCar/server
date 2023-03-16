var socket = null;
var hostUrl = null;

function init() {
  hostUrl = "http://localhost:5001";

  console.log("Initializing client...");
  connect();
}

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
    
    socket.emit("joinRoom", {room: "user"})
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

  socket.on("stream", function (data) {
    // Data is an ArrayBuffer

    // Data is DirectByteBuffer in Java
    // console.log("Client received: " + data);

    // Convert ArrayBuffer to Base64
    const img = document.querySelector("img");
    img.src = "data:image/jpeg;base64," + data;
  });
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

function sendNXTControl(direction){
  if (isConnected()) {
    socket.emit("nxtControl", direction);
  }
}
