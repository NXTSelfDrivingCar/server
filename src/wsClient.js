var socket = null;

function init() {
  hostUrl = "http://localhost:5001";
}

// Povezivanje klijenta na wss
function connect() {
  socket = io.connect("http://localhost:5001", {
    transports: ["websocket"],
    cors: {
      origin: "http://localhost:5001",
      methods: ["GET", "POST"],
    },
  });
}
