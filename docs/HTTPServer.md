# Opis

HTTP Server zaduzen je za prihvatanje i rutiranje svih HTTP zahteva, kao i renderovanje html/ejs stranica. 
Modul za pokretanje HTTP servera vrsi se [Express](https://expressjs.com/) NodeJS bibliotekom.

```js
import express, { Express, Request, Response } from "express";
```

Identifikacija korisnika vrsi se JWT tokenom

```js
import jwt from "jsonwebtoken";
```

# Inicijalizacija

HTTP server sastoji se iz nekoliko modula:
- Express `Express`
- WebSocketServer `Socket.IO`
- EmailServer `nodemailer`

Rute kojima korisnik moze da pristupi ili pozove preko HTTP zahteva, nalaze se u svojim modulima
- guestRoutes
- userRoutes
- adminRoutes
- ajaxRoutes
- sharedRoutes

Svi moduli bice inicijalizovani unutar _HTTPServer.js_ modula

### Express

```js
// HTTPServer.js

var app: Express = express();

app.use(cookies());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/static", express.static(path.join(__dirname, "public")));

// Inicijalizacija HTTPServer-a
app.listen(HttpServerConfig.PORT, () => { ... });
```

### WebSocketServer

```js
// HTTPServer.js

// Import WebSocket server
import { WebSocketServer } from "./webSocket/WebSocketServer";
import { WSSConfig } from "./config/server/wsServerConfig";
import { createServer } from "http";

// Inicijalizacija WebSocketServer-a
const httpServer = createServer(app);
const wss = new WebSocketServer(httpServer);
wss.init(WSSConfig.PORT);
```

### EmailServer

```js
// HTTPServer.js

// Import EmailHandler
import { EmailHandler } from "./emailHandler/emailHandler";
import { EmailConfig } from "./config/shared/emailConfig";

// Inicijalizacija EmailServer-a
const emailHandler = new EmailHandler(EmailConfig.USER, EmailConfig.PASS);
emailHandler.init();
```

### Rute

```js
// HTTPServer.js

// Import routes
const guestRoutes = require ("./routes/guestRoutes")(app);
const userRoutes = require ("./routes/userRoutes")(app);
const adminRoutes = require ("./routes/adminRoutes")(app);
const ajaxRoutes = require ("./routes/ajaxRoutes")(app);
const sharedRoutes = require ("./routes/sharedRoutes")(app);
```

# Rutiranje 

Rutiranje korisnickih HTTP zahteva, vrsi se u definisanim [[#Rute|modulima]]. 
Podela ruta vrsi se na:
- GET
- POST
- DELETE
- ...

Svaki route handler sastoji se iz:
- Metode (get/post/delete/...)
- Naziva rute
- Liste _middleware_ funkcija

```js
app.get("<route>", middlewareFun1(), middlewareFun2(), ..., (req: Request, res: Response) => {
	// Open the page
	res.render("<page>.ejs", { ... })
})
```

```js
app.get("/profile", Authorization.authRole('admin', 'user'), async (req: Request, res: Response) => {
	res.render("user_edit.ejs", { ... })
})
```

Pozivanje rute `/profile` prvo se proverava metoda kojom je ona pozvana, a zatim se okidaju, redom, sve _middleware_ funkcije. Prelazenje sa jedne _middleware_ funkcije na narednu vrsi se funkcijom `next()` u samoj _middleware_ funkciji. 
- U primeru autorizacije korisnika, u slucaju da je korisnik autorizovan, poziva se `next()`
- U slucaju da korisnik nije autorizovan, vrsi se rerutiranje na drugu stranicu ili drugu funkciju.

> _Middleware_ funkcija je funkcija koja ima pristup `Request` i `Response` objektima. Okidanje _middleware_ funkcije se desava nakon pozivanja rute, a sledeci nakon pozivanja `next()` funkcije.

```js
class Authorization{
	authRole(role){
		if(req.body.user.role === role){
			next()
			return
		}
		redirect("/Page404")
	}
}
```

U navedenoj funkciji `authRole` vidimo da se, u slucaju autorizovane uloge, poziva `next()` funkcija koja poziva sledeci _middleware_ ili redirektuje, u suprotnom.

> Poslednja _middleware_ funckija je, u vecini slucajeva, anonimna.

- Ostale informacije o drugim vrstama _middleware_ funkcija mogu se naci [ovde](https://expressjs.com/en/guide/using-middleware.html)

## Parametri metode zahteva

Pristupanje parametrima metode razlikuje se od vrste same metode, ali i vrste definisane rute.

- Pristupanje parametrima `GET` metode odvojenim znakom pitanja ( ? ), vrsi se parametrom `query` iz `Request` objekta

 Primer GET zahteva je http://localhost:5000/profile?userID=1234-1234-1234-1234
 
> Parametri su /profile koji je sama putanja i userID koji je odvojen znakom pitanja ( ? )

```js
// Pozivanje rute http://localhost:5000/profile?userID=1234-1234-1234-1234

app.get("/profile", Authorization.authRole('admin', 'user'), async (req: Request, res: Response) => {
	console.log("User ID: " + req.body.userID) // User ID: 1234-1234-1234-1234
})
```

- Pristupanje parametrima `GET` metode odvojenim dvema tackama ( : ), vrsi parametrom `params` iz `Request` objekta

Primer GET zahteva je http://localhost:5000/profile/1234-1234-1234-1234

> Parametri su /profile koji je sama putanja i dodatni parametar 1234-1234-1234-1234 koji je u prototipu putanje definisan kao :userID
> Vidimo da se umesto navodjenja naziva parametra, na ovaj nacin samo zamene vrednosti i stave na mesto definisanom dvema tackama ( : )

```js
// Pozivanje rute http://localhost:5000/profile/1234-1234-1234-1234

app.get("/profile/:userID", Authorization.authRole('admin', 'user'), async (req: Request, res: Response) => {
	console.log("User ID: " + req.params.userID) // User ID: 1234-1234-1234-1234
})
```

- Pristupanje parametrima `POST` metode vrsi se parametrom `query` iz `Request` objekta

Primer POST zahteva je http://localhost:5000/profile/

> Vidimo da se u putanji ne prikazuju prosledjeni parametri, vec su oni definisani u nekoj HTML formi  

```js
// Slanje POST zahteva na rutu http://localhost:5000/profile/
// Vrednost zahteva: userID: 1234-1234-1234-1234

app.post("/profile/:userID", Authorization.authRole('admin', 'user'), async (req: Request, res: Response) => {
	console.log("User ID: " + req.query.userID) // User ID: 1234-1234-1234-1234
})
```