# Opis

- WebSocket je tehnologija koja omogucava otvorenu komunikaciju izmedju klijenta i hosta.
- Konekcija klijenta sa serverom omogucava kontinualnu komunikaciju izmedju ove dve strane. Povezivanje klijenta i odrzavanje veze vrsi se preko klijentske strane sistema (front).

# Implementacija

- Za povezivanje korisnika sa serverom preko _WebSocket-a_ potrebno je omoguciti HTTP zahtev na adresu koja je registrovana za prihvatanje WebSocket zahteva.
	- U primeru ispod, adresa `http://localhost:5001` je registrovana kao adresa za WebSocket server kroz port `5001` 

```js
const address = "http://localhost:5001";
var socket = null; // Definisanje globalne promenljive socket

// Povezivanje klijenta sa WebSocket serverom
socket = io.connect(address, {
  transports: ["websocket"],
  cors: {
	origin: address,
	methods: ["GET", "POST"],
  },
});
```

- Pri povezivanju _socket-a_, moguce je proslediti i dodatne parametre, koji se mogu koristiti za autentifikaciju ili u druge svrhe.

```js
// Client side

// Prosledjivanje parametara tokom inicijalizovanja konekcije
const socket = io({  
	query: {  
	room: "<roomName>" 
	}  
});
```

- Ovaj parametar se moze prihvatiti kroz `socket.handshake.query`, tokom `on("connection", (socket) => { ... })` funckije
	- Vise o prihvatanju parametara na strani servera se moze naci [ovde](https://github.com/NXTSelfDrivingCar/server/blob/main/docs/WebSocket%20-%20Server.md#definicija-websocketconnectionhandler-modula)

```js
// Server side

io.on("connection", (socket) => {  
	console.log(socket.handshake.query); // prints { room: "<roomName>", EIO: "4", transport: "polling" }  
});
```

## Provera veze

### Connect

- Povezivanje se vrsi definisanom funkcijom `io.connect(...)` koja vraca povezani _socket_

```js
var socket = io.connect(...)
```

### Dosconnect

- Prekidanje sesije moze se obaviti onda kada je socket vec povezan (odnosno kada nije `null`) funkcijom `socket.disconnect()`

```js
socket.disconnect();
socket = null
```

> Po prekidanju sesije, pozeljno je podesiti _socket_ na `null` ponovo radi kasnije provere 

### isConnected()

- `isConnected()` je funkcija koja vraca _true_ ili _false_ u zavisnosti da li je socket trenutno povezan

> Ova funkcija radi po principu globalne promenljive `socket` za svaku web stranicu.

## Povezivanje sa kanalima

- Kako bi se korisnik registrovao na neki od ponudjenih kanala (user, streamer, admin, gps), potrebno je emitovati `joinRoom` [dogadjaj](https://github.com/NXTSelfDrivingCar/server/blob/main/docs/WebSocket%20-%20Server.md#dogadjaji) sa nazivom sobe `room:'<roomName>'` i opcionim JWT tokenom `token:'<token>'` koji ce sluziti za autentifikaciju <u>Android</u> korisnika.

```js
// Emitovanje zahteva za povezivanje sa kanalom
socket.emit("joinRoom", {
  room: "<roomName>",
  token: "<token>"
});
```

> Povezivanje sa kanalima moguce je obaviti u periodu od 5 sekundi, nakon cega se automatski dodeljuje _user_ kanal.

## Slusanje za dogadjaje

- Slusanje za dogadjaje koje emituje WebSocket server ili socket salje nazad se vrsi `on` funkcijom.

```js
socket.on("<event>", function (data) { ... });
```

##### Stream:

```js
// Prihvatanje podataka koji se salju tokom video stream-a
socket.on("stream", function (data) {
	const img = document.querySelector("img");
	img.src = "data:image/jpeg;base64," + data;
});
```

