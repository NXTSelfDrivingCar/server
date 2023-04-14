# Opis

- WebSocket je tehnologija koja omogućava interaktivnu duplex komunikaciju između dva uređaja. 
- Za razliku od _HTTP_, upotrebom WebSocket tehnologije otvara se kontinualna veza između klijenta i hosta.
- WebSocket servis se sastoji iz dve strane, klijentske i serverske, koje posebno moraju da se definisu.

# Definicija

Kako bi se omogućila konekcija preko WebSocket-a, klijent mora prvo poslati HTTP zahtev koji potvrđuje da li postoji WebSocket tehnologija na serveru. Nakon što server odgovori pozitivno, otvara se konekcija.

Za potrebe korišćenja WebSocket tehnologije, koristi se `Socket.IO` biblioteka za _NodeJS_. 

```js
// WebSocket.js

import { Server } from "socket.io";

const WEBSOCKET_CORS = {
    origin: "*",
    methods: ["GET", "POST"],
};

export class WebSocket extends Server {

    private static io: WebSocket;
	
    constructor(httpServer: any) {
        super(httpServer, {
            cors: WEBSOCKET_CORS,
        });
    }

	// Definicija singleton klase
    public static getInstance(httpServer: any): WebSocket {
        if (!WebSocket.io) {
            WebSocket.io = new WebSocket(httpServer);
        }
        return WebSocket.io;
    }
    
    public getIO(): WebSocket {
        return WebSocket.io;
    }
}
```

Kako bi imali pristup na višem nivou, kreirali smo klasu u modulu _WebSocketServer.js_
- Klasi `WebSocketServer` prosledjujemo `Express` HTTP server i pozivamo instancu `WebSocket` klase kojoj prosledjujemo kreirani HTTP server.

```js
// WebSocketServer.js

export class WebSocketServer {
    private httpServer: any;
    private io: WebSocket;

    constructor(httpServer: any) {
        this.httpServer = createServer(httpServer);
        this.io = WebSocket.getInstance(this.httpServer);
    }

    public init(port: number){
        this.httpServer.listen(port, () => {
            console.log(`WebSocket Server listening on port ${port}`);
        });
    }
}
```

## Inicijalizacija 

Inicijalizovanje _WebSocketServer-a_ vrsimo u modulu _HTTPServer.js_ (Detaljnija definicija HTTP servera se nalazi [ovde](https://github.com/NXTSelfDrivingCar/server/blob/main/docs/HTTPServer.md))

```js
// HTTPServer.js

// Start WebSocket server
const httpServer = createServer(app);
const wss = new WebSocketServer(httpServer);
wss.init(WSSConfig.PORT); // 5001
```

Na ovaj nacin pokrenuli smo WebSocket servis koji ce raditi u pozadini.

## Socket

- Socket je klijentski objekat koji definise otvorenu komunikaciju sa drugom stranom (serverom)
- Pri izvrsenoj konekciji, na server se prosledjuje socket objekat koji moze da emituje i slusa za dogadjaje koje emituje taj (ili drugi) socket ili sam WebSocket. (Detaljnija definicija klijentskog WebSocket protokola se nalazi [ovde](https://github.com/NXTSelfDrivingCar/server/blob/main/docs/WebSocket%20-%20Klijent.md))
	- Identifikacija veze socket-a vrsi se preko parametra `SID` koji sadrzi identifikator sesije.

```js
console.log("SID: " + socket.SID) // SID: FSDjX-WRwSA4zTZMALqx
```

- Svaki socket se moze pridruziti jednom ili vise kanala kojima se mogu emitovati dogadjaji.
	- Socket/Server moze emitovati u svom kanalu ili generalno na citavoj konekciji ili samom sebi

```js
// Povezivanje sa sobom
socket.join("<room>")
```

### Dogadjaji

- Socket ili WebSocket mogu da emituju dogadjaje koje ostali mogu da slusaju.
- Dogadjaje mogu slusati i emitovati _WebSocketServer_ i _Socket_
	- Svaki dogadjaj definise se svojim nazivom koji je tipa `String` i podacima, koji su tipa `Object`

#### Emitovanje

- Emitovanje dogadjaja se moze izvrsiti na nekoliko nacina (Opisano iz ugla _WebSocketServer-a_)
	- `io.emit("<event>", data)`
		- U slucaju emitovanja dogadjaja bez kljucne reci `to`, svaki _Socket_ koji slusa za taj dogadjaj ce primiti podatke
	- `io.to("<socket/channel>").emit("<event>", data)`
		- Upotrebom kljucne reci `to` mogu se definisati specificni kanali ili _Socket-i_ koji ce jedino moci da prihvate podatke ovog dogadjaja
- Socket moze poslati podatke samom sebi, koji se mogu prihvatiti na strani servera iskljucivo od strane tog _Socket-a_
	- `socket.send(data)`
	- Da bi se prihvatili podaci na serverskoj strani, slusa se `"message"` dogadjaj -> `socket.on("message", data)`

#### Slusanje

- Slusanje za dogadjaje vrsi se kljucnom reci `on`
	- `io.on("<event>", data)`
	- `socket.on("<event>", data)`

## Definicija WebSocketConnectionHandler modula

`WebSocketConnectionHandler` modul sluzi za kontrolu socket-ima pri njhovom <u>povezivanju</u> ili <u>iskljucivanju</u> sa mreze. 
Pri uspesnom povezivanju, na server se, kroz dogadjaj `connection` salje sam socket na koji se kasnije mogu dodati `on` _listener-i_

```js
// WebSocketConnectionHandler.js

io.on("connection", (socket: any) => { 

	// Svaki povezani socket ce moci da slusa za dogadjaj '<event>'
	socket.on("<event>", (data: any) => { ... })
	socket.on("<event2>", (data: any) => { ... })
	...
}
```

- Prihvatanje parametara odmah u tokom procesa ostvarivanja konekcije sa serverom vrsi se putem `socket.handshake.query.<param>`
	- Vise o inicijalizaciji klijenta se moze naci -> [Client Initialization | Socket.IO](https://socket.io/docs/v3/client-initialization/)

```js
// Client-side

// Slanje parametara tokom povezivanja sa serverom
const socket = io({  
	query: {  
		x: 42  
	}  
});
```

```js
// Server-side

io.on("connection", (socket) => {  
	console.log(socket.handshake.query); // prints { x: "42", EIO: "4", transport: "polling" }  
});
```

> Vazno je napomenuti da se prosledjeni parametri kroz `query` ne mogu menjati tokom trajanja aktivne sesije (konekcije), pa se oni mogu promeniti tokom emitovanja `reconnect_attempt` dogadjaja

```js
// Server-side

// Prosledjeni parametar X povecavamo tek onda kada se pokrene reconnect_attempt dogadjaj
socket.io.on("reconnect_attempt", () => {  
	socket.io.opts.query.x++;  
});
```

#### Povezivanje u sobu

- Identifikacija socket-a vrsi se njegovim povezivanjem na dve specificne sobe 
	- Role (User | Admin | Streamer | GPS)
	- UserID -> Unikatan identifikator korisnika koji se povezao
- Ova identifikacija vrsi se korisnickim emitovanjem dogadjaja `joinRoom`. pracenim nazivom **ROLE** sobe
	- Nakon emitovanja ovog dogadjaja, `WebSocketClientHandler` vrsi dalju proveru i autentifikaciju

```js
// Index.html

socket.emit("joinRoom", {
  room: "user"
});
```

- Sa serverske strane se povezivanje sa kanalom vrsi u modulu `WebSocketConnectionHandler.js`, koji poziva funkciju klase `WSClientHandler`

```js
// WebSocketConnectionHandler.js

const clientHandler = WSClientHandler.getInstance(io.getIO());

socket.on("joinRoom", (data: any) => {
		clientHandler.joinRooms(socket, data);
	})
```

- Sa strane Android korisnika, uz naziv sobe, salje se i parametar `token` koji definise JWT token prosledjen pri uspesnom povezivanju na aplikaciju

```kotlin
// Android aplikacija

socket.emit("joinRoom", {
  room: "streamer",
  token: "<JWTToken>"
});
```

## Definicija WSClientHandler klase

`WebSocketClientHandler.js` sadrzi `WSClientHandler` koja je zaduzena za autentifikaciju svih povezanih korisnika. Ova klasa vrsi proveru parametara za povezivanje sa potrebnim kanalima i dodeljuje korisnicki identifikator kao identifikator samog _Socket-a_

Ova klasa je po definiciji **Singleton**, tako da se njena instanca moze deliti izmedju modula.

#### JoinRoom dogadjaj

- **JoinRoom** dogadjaj vrsi proveru parametara na sledeci nacin:
	- Ako soba nije definisana ili socket vec pripada toj sobi, on se povezue sa _User_ sobom
	- Ako je soba _Admin_, vrsi se autorizacija korisnika za potrebne dozvole
	- Proverava se da li je prosledjen token (u slucaju Android aplikacije)
	- Socket se povezuje sa sobom
	- Socket se identifikuje korisnickim jedinstvenim identifikatorom
- Na samom kraju se vrsi provera ostalih parametara pri povezivanju korisnika sa osbom kroz privatnu funkciju `_checkInSocket(socket)`

```js
// WSClientHandler

public async joinRooms(socket: any, data: any){
	this._addToTmpClients(socket);        

	// If the room is not defined, join the default room (user)
	if (!data.room || socket.rooms.has(data.room)) socket.join(rooms.get("default"));

	// If the room is admin, check if the user is authorized to join the room
	if (data.room === "admin") {
	
		// If the user is not authorized (or the ticket is invalid), disconnect the socket
		if (!Authorization.authorizeSocket(socket, "auth", true, "admin")) {
			socket.disconnect();
			return;
		}
	}

	// If token doesn't exist, set it to an empty string (because of streamers that have to send the token in the data)
	var token = data.token ? data.token : ""

	// Joins the room
	socket.join(rooms.get(data.room));

	await this.attachUserIdToSocket(socket, token);

	// If the room is user, add the socket to the connected clients
	this._checkInSocket(socket);
}
```

#### CheckInSocket

Povezivanje socket-a sa serverom uspostavlja se onda kada on zvanicno izbrisan iz liste privremenih klijenata i unesen u neku od klijentskih list
- Streamer
- Client

Pri uspesnom povezivanju svakog klijenta, na administratorski kanal se emituje dogadjaj `clientConnected` uz potrebne podatke o povezanom korisniku,

```js
// WSClientHandler

private _checkInSocket(socket: any){

	// If the socket is not a user, disconnect it or if it is not in any room
	if(!socket["userId"] || socket.rooms.length < 2)
	{
		this.removeClient(socket.id);
		socket.disconnect();
		return;
	}

	if(socket.rooms.has("streamer")) this._addToStreamerClients(socket);

	// Socket cannot be a guest and not have the gps room (only GPS devices can be guests)
	if(!socket.rooms.has("gps") && socket["userId"] === "guest")
	{  
		this.removeClient(socket.id);
		socket.disconnect();
		return;
	}

	this._addToConnectedClients(socket);
	this._removeFromTmpClients(socket);

	// Emit the client connected event to the admin room
	this._getReturnFormat(socket.id).then((data: any) => {
		WSClientHandler.io.to("admin").emit("clientConnected", data);
	});
}
```

## Definicija WebSocketAdminHandler modula

`WebSocketAdminHandler` modul se koristi kako bi administratori u sistemu mogli da vode evidenciju o trenutno povezanim uredjajima.

Trenutni registrovani dogadjaji:
- kickUser
- requestClientList
- clientConnected -> _Client-side_

### Inicijalizacija

Ovaj modul, ali i ostali `handler-i`, inicijalizuje se u `WebSocketConnectionHandler.js` modulu.

```js
// WebCocketConnectionHandler.js

 // If the user is authorized as an admin, create an admin handler for the socket
if(await Authorization.authorizeSocket(socket, "auth", false, "admin")){
	var adminHandler = require("./WebSocketAdminHandler")(io, socket);
}
```

### Upotreba

```js
// WebSocketAdminHandler.js

module.exports = function(io: any, socket: any){

    const clientHandler = WSClientHandler.getInstance(io);

    socket.on("kickUser", (data: any) => {
        kickUser(socket, data, clientHandler);
    })

    socket.on("requestClientList", () => {
        clientHandler.requestClientList(socket);
    })
}
```

- Prinudno prekidanje veze nekog korisnika vrsi se funkcijom `kickUser(socket, data, clientHandler)`
	- Ova funkcija nije deo samog clientHandler modula jer se koristi iskljucivo kroz administratorski panel

```js
function kickUser(socket:any, data: any, clientHandler: WSClientHandler){

    socket.to(data.SID).emit("message", "You have been kicked from the server, please reconnect");

    var kickedSocket = clientHandler.getConnectedClientsBySocketId(data.SID);

    if(kickedSocket){
        kickedSocket.socket.disconnect();
    }

    clientHandler.removeClient(data.SID);
}
```

## Definicija WebSocketStreamHandler modula

- Ovaj modul je zaduzen za prosledjivanje stream-a podataka korisnicima identifikovanim istim _UserID-em_
	- Ovo proledjivanje namenjeno je iskljucivo kako bi odredjeni stream podataka dobili specificni korisnici

```js
socket.on("stream", (data: any) => {
	io.to(socket["userId"]).emit("stream", data);
})
```
