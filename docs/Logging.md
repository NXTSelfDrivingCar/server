# Opis

Logovanje je vrlo bitan segment u pracenju funkcionalnosti aktivnog servisa. Logovanjem je moguce ispratiti akcije korisnika servisa, ali i samih unutrasnjih procesa.

Logovanje na **NXTSelfDrivingCar** veb serveru vrsi se pomocu klase `LogHandler`  
Pristup kreiranim log fajlovima se vrsi klasama `LogController` i `LogRepository`

## Koriscenje

Kako bi se pokrenuo proces logovanja, na jednoj strani se mora instancirati objekat klase `LogHandler`, koji interno poziva `open()` metodu. Ova metoda zapocinje proces logovanja i proverava se svakim instanciranjem objekta `LogHandler`, ali se otvara samo jednom.

```js
// httpServer.ts

// Import logger
import { LogHandler } from "./logging/logHandler";
const logger = new LogHandler();
```

> Putanja do svih log fajlova je uvek `../logs`

#### Logovanje procesa

Logovanje procesa vrsi se prosledjivanjem <u>JSON</u> formata podataka u predvidjenu metodu. 
Nakon uspesnog logovanja, red ce biti smesten u trenutno aktivan log dokument.

Za logovanje procesa, koriste se tri metode:
- `info(data: any)`
- `warn(data: any)`
- `error(data: any)`

> Standard koriscenja logging metoda zahteva postojanje `origin` i `action` kljuca, po kome se kasnije mogu vrsiti ostala filtirranja.

```js
// Primer upotrebe info metode
logger.info({
	origin: "HttpServer",
	action: "init",
	details: { 
		serverType: "HttpServer", 
		port: HttpServerConfig.PORT 
	},
  });

// Primer upotrebe warn metode
logger.warn({
	origin: "Authorization", 
	action: "getUserFromToken", 
	message: "User does not exist", 
});

// Primer upotrebe error metode
 logger.error({
	 origin: "Authorization", 
	 action: "getUserFromToken", 
	 message: "Error while getting user from token", 
 })
```

##### Log fajl

Format log fajla ne zahteva (ali je pozeljno) postojanje `origin` i `action` kljuceva. 
Pored njih, kljuc `level` se dodaje kao filter nivoa tezine vaznosti loga i `timestamp` kao vremenska odrednica kada je taj log nastupio

```json
{
  "origin": "UserRepository",
  "collection": "users",
  "method": "_findUserByFilter",
  "filter": {
  "id": "64092371-76d1-46f6-aebd-e60751dc93ec"
  },
  "level": "INFO",
  "timestamp": 1679003046115
}
```

#### Logovanje ruti (RouteWatcher)

> **Note**
> Upotreba funkcije `logRoute` prebacena je iz `LogHandler` u `RouteWatcher` klasu, radi resavanja problema ciklicne zavisnosti.

Logovanje zahteva koji su poslati na neku adresu se moze obaviti upotrebom staticke funkcije `logRoute(action: string, extra: any = {})` u klasi `RouteWatcher`, koja za parametar `action` uzima naziv akcije koji je uradjen na nekoj adresi (recimo `GET` na adresi `/admin/users/list` bi mogao da bude `action = getUsers`). 
Upotreba ove funkcije zahteva njeno smestanje kao [middleware](https://github.com/NXTSelfDrivingCar/server/blob/main/docs/HTTPServer.md#rutiranje).

```js
// RouteWatcher class
public static logRoute(action: string, extra: any = {}) {
	return (req: Request, res: Response, next: any) => {
	    RouteWatcher._logRoute(req, res, next, action, extra);
	    next();
	}
}
```

Parametri koje korisnik prosledjuje su `action` i `extra`, dok se `req` i `res` prosledjuju automatski, kao deo _middleware_ procesa.

> Logovi kreirani u procesu belezenja zahteva se oznacavaju kljucem `origin: route`

```js
app.get("/admin/users/list", RouteWatcher.logRoute("listUsers"), ... , async (req: Request, res: Response) => { ... }
```

Ovak log je zaduzen za belezenje svih zahteva i parametara koji su kroz njega prosledjeni. 

> **Note**
> `logRoute` ne belezi citav zahtev, vec samo prosledjene parametre. 

Primer loga koji belezi pristupanje jednom od log fajlova.

```json
{
  "origin": "route",
  "action": "viewLog",
  "method": "GET",
  "url": "/admin/logs/l/log_1681059544883.json",
  "path": "/admin/logs/l/log_1681059544883.json",
  "params": {
    "name": "log_1681059544883.json"
  },
  "level": "INFO",
  "timestamp": 1681061363130
}
```

## Pristupanje logovima

Kao <u>Administrator</u>, mozete pristupiti svim logovima na putanji `http://localhost:5000/admin/logs`, koja vraca prikaz svih postojecih logova. Pritiskom na neki od log fajlova, dobijate pristup svim zapisima u tom logu, koji se mogu filtrirati po postojecim kriterijumima.

Takodje je moguce brisanje logova, ali za to je potreba ponovna autorizacija unosom korisnicke sifre.

Sa administratorske strane, moguce je vrsiti pregled logova po sledecim kriterijumima:
- Level : Nivo vaznosti loga
	- INFO
	- WARN
	- ERROR
- Origin : Klasa porekla loga
- Acion : Akcija koja je obavljena 

> Pretrazivanje logova je case isensitive i radi se po parcijalnom pogotku. (Auth ce vratiti i 'Auth' i 'Authorization' i 'authorization')

Primer loga za neuspesnu autorizaciju pri zahtevu za brisanje drugog loga. 

```json
{
  "origin": "Authorization",
  "action": "authUser",
  "url": "/admin/log/delete/log_1679006044820.json",
  "redirectPage": "",
  "ip": "::1",
  "headers": {
    "host": "localhost:5000",
    "connection": "keep-alive",
    "content-length": "12",
    "cache-control": "max-age=0",
    "origin": "http://localhost:5000",
	...
	"content-type": "application/x-www-form-urlencoded",
	"user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 Edg/112.0.1722.34",
    "referer": "http://localhost:5000/admin/logs/l/log_1679006044820.json",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-US,en;q=0.9",
  },
  "body": {
    "password": "123"
  },
  "message": "User is not logged in (password is incorrect)",
  "user": {
    "id": "64092371-76d1-46f6-aebd-e60751dc93ec",
    "username": "AnTasMes",
    "role": "admin"
  },
  "level": "WARNING",
  "timestamp": 1681079541305
}
```

U ovom logu se mogu pronaci mnoge bitne informacije o prosledjenom zahtevu ili korisniku koji ga je prosledio.
- Strana porekla
- Ciljana strana
- Podaci o korisniku

## Proces inicijalizacije

Pri svakoj inicijalizaciji klase `LogHandler` vrsi se provera dostupnosti direktorijuma za smestanje log fajlova i provera da li je neki trenutno otvoren. Ovaj proces pokrece se automatskim pozivanjem
funkcije `open()`.
- Inicijalizacija klase `LogHandler`
- Provera trenutnog statusa aktivnosti loga (inicijalno **CLOSED**)
- Provera dostupnosti direktorijuma za cuvanje log fajlova - `_prepareDir()`
- Postavljanje putanje ka aktivnom logu
- Postavljanje statusa aktivnosti loga na **OPEN**
- Unosenje inicijalnih vrednosti u log radi postavljanja strukture JSON fajla - `_writeOpener()`

```js
// LogHandler class
constructor(){
        LogHandler.filePath = path.join(__dirname, "..", "logs");

        this.open();
    }
    
    open(){
        if(LogHandler.status == statuses.OPEN){
            return;
        }

        this._prepareDir();
        
        LogHandler.currentFile = path.join(LogHandler.filePath.toString(), fileName);
        LogHandler.status = statuses.OPEN;

        this._writeOpener();
    }
    
    ...
```
