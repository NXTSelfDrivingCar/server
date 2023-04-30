var socket = null;
var hostUrl = null;

var clients = {};

function init() {
  hostUrl = "http://localhost:5001";

  connect();
}

function isConnected() {
  return socket !== null;
}

function requestRoom() {
  console.log("Requesting room...");
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
    console.log("Connecting socket...");

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
    }, 3000);

    setInterval(() => {
      requestClientList();
    }, 15000);
  } catch (error) {
    console.log(error);
  }

  socket.on("clientList", (data) => {
    addClient(data);
    updateFront(clients);
  });

  socket.on("clientDisconnected", (data) => {
    console.log("Client disconnected: " + data.SID);
    delete clients[data.SID];

    updateFront(clients);
  });

  socket.on("clientConnected", (data) => {
    addClient(data);
    updateFront(clients);
  });
}

function kickUser(socketId) {
  if (confirm("Are you sure you want to kick this user?") == false) {
    return;
  }

  socket.emit("kickUser", { SID: socketId });
}

function requestClientList() {
  socket.emit("requestClientList");
}

function addClient(clientData) {
  if (clients[clientData.SID] === undefined) {
    clients[clientData.SID] = clientData;
  }
}
