Za povezivanje korisnika sa serverom dužan je NodeJS http modul, koji obavlja prihvatanje i rešavanje REST zahteva. 
Pored http modula, u opticaju su i TCP i UDP protokoli za oogućavanje bezbedne konekcije korisnika sa serverom, ali i prenošenje video informacija velikom brzinom.

## NodeJS http modul:

- HTTP modul služi za upravljanje i rešavanje *Representational State Transfer* (REST) zahteva od korisnika. 
- Ovaj modul biće zadužen za prosleđivanje informacija iz [[Baza podataka|baze podataka]], ali i u nju.

#### Arhitektura:

- Za jednostavnu komunikaciju sa korisnicima, koristi se MVC arhitektura, koja omogućava podelu segmenata pogleda, modela i kontrolera logike, kako bi se ubrzao i pojednostavio proces.
	- Primer MVC arhitekture nad modelom Korisnika (User) prikazana je na slici

![[Konekcija 2022-12-10 20.45.30.excalidraw|Primer MVC arhitekture]]

- **View** dobija neki korisnicki unos. Većinski REST Request i prosleđuje ga **kontroleru** korisnika, koji izvršava biznis logiku (proveravanje da li korisnik već postoji, da li su kredidencijali u pravom formatu...). 
- Ova logika izvršava se upotrebom **UserRepository** modula, koji obavlja vezu sa bazom podataka.
- Kontroler vraća model korisnika koji se prikazuje na korisničkom interfejsu.

#### Dijagram povezivanja servisa HTTP

![[Pasted image 20230414152925.png]]

##### Proces povezivanja po dijagramu (HTTP):

- Korisnici za veb pretrazivaca
	- Salje zahtev za povezivanje na servis
	- Zahtev prihvata NodeJS server 
		- Zahtev se prosledjuje potrebnom kontroleru
		- *Ako je potrebno, proverava se baza pdataka*
		- Kontroler vraca odgovor serveru
	- Server vraca odgovor korisniku
	- *Ako je potrebno, kreira se JWT token*
- Korisnici sa Android aplikacija
	- Salju zahtev za povezivanje na servis
	- Zahtev prihvata NodeJS server
		- Zahtev se prosledjuje potrebnom kontroleru
		- *Ako je potrebno, proverava se baza podataka*
		- Kontroler vraca odgovor serveru
	- Server kreira JWT token
	- Server salje odgovor klijentu

#### Dijagram povezivanja servisa WebSocket

> Za detalje povezivanja preko WebSocket-a, pogledati [[WebSocket - Klijent]] ili [[WebSocket - Server]]

![[Pasted image 20230414153418.png]]

Upotrebom WebSocket protokola, omoguceno je nesmetano slanje video stream-a NodeJS serveru, koji vrsi rutiranje tih podataka autorizovanim klijentima na veb pretrazivacima i Python servisu za obradu.

##### Proces povezivanja po dijagramu (WebSocket)

- Korisnici sa veb pretrazivaca
	- Salju HTTP zahtev NodeJS serveru
	- Server se konsultuje sa kontrolerom i bazom podataka
	- Server odgovori *pozitivno*
	- Klijent salje zahtev za povezivanje WebSocket protokola
	- Server vrsi autorizaciju zahteva ([[WebSocket - Server]])
	- Klijentu se dodeljuju ogranicena prava za komunikaciju preko *WebSocket*-a
- Korisnici sa Android aplikacija
	- Salju WebSocket zahtev
	- Server vrsi autorizaciju zahteva ([[WebSocket - Server]])
	- Klijentu se dodeljju ogranicena prava za komunikaciju preko *WebSocket*-a

#### Kreiranje servera:

- Za upotrebu NodeJS http modula, potrebno je isti uključiti u projekat 
```JavaScript
const http = require('http');
```

- Za povezivane sa MongoDB bazom podataka, potrebno je uključiti mongodb modul
```JavaScript
const mongoClient = require('mongodb').MongoClient;
```

- Kreiranje servera, ali i dodavanje funckija za određene rute, vrši se upotrebom funkcije createServer
```JavaScript
var server = http.createServer(function (req, res) {
  switch (req.url) {
    case "/":
      printMainPage(req, res);
      break;
    case "/user/register":
      registerUser(req, res);
      break;
    default:
      res.end("Invalid request!");
  }
});
```

- Funkcija `createServer` zahteva parametre:
	- req: *Request* -> Vrednosti zahteva koji smo poslali na određenu rutu (npr. JSON korisnika na user/register)
	- res: *Response* -> Odgovor koji vraćamo korisniku nakon izvršenog zahteva

- Pokretanje HTTP servera vrši se upotrebom funkcije listen, koja sluša određeni port ili vraća grešku
```JavaScript
server.listen(port, function (err) {
  if (err) throw err;
  console.log("Node.js web server at port 5000 is running.");
});
```
