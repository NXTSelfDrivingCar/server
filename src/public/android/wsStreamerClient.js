var socket = null;

const address = "http://localhost:5001";

function connect() {
  console.log("Connecting client... ");

  if (isConnected()) {
    console.log("Client is already connected");
    return;
  }

  try {
    socket = io.connect(address, {
      transports: ["websocket"],
      cors: {
        origin: address,
        methods: ["GET", "POST"],
      },
    });

    console.log("Client connected");

    socket.emit("joinRoom", {
      room: "streamer",
      token:
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NDA5MjM3MS03NmQxLTQ2ZjYtYWViZC1lNjA3NTFkYzkzZWMiLCJpYXQiOjE2NzczMjg4MTMsImV4cCI6MTY3NzMzMjQxM30.IM5C1YG2hhmrwuCF3WSnvxvWNbO3ZbRzUa3d0YAKEts",
    });
  } catch (error) {
    console.log("There has been an error during establishing connection");
    console.log(error);
    return;
  }
}

function disconnect() {
  console.log("Disconnecting client...");

  if (!isConnected()) {
    console.log("Client was not connected");
    return;
  }

  socket.disconnect();
  socket = null;

  console.log("Client disconnected!");
}

function isConnected() {
  if (socket == null) {
    return false;
  }
  return socket.connected;
}
