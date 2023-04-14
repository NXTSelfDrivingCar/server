# NXTSelfDrivingCar server

Kao glavni deo projekta <u>NXTSelfDrivingCar</u> server predstavlja sponu izmedju korisnika i svih servisa koji omigucavaju povezivanje sa svojim Lego NXT modulima. 

## Cilj

Cilj servera je da omoguci nesmetanu razmenu podataka izmedju Android aplikacije, koja salje video stream i slusa za komande kretanja, klijenata koji koriste veb pretrazivac da vide napredak njihovih NXT terminala i Python servisa, na kom se nalazi model vestacke inteligencije.

Detaljna **dokumentacija** projekta i njegovih modula se moze naci [ovde](https://github.com/NXTSelfDrivingCar/server/tree/main/docs).

## Struktura

Podela servera je na dva dela:
- **NodeJS** - Vrsi rutiranje komunikacije klijenata veb pretrazivaca i Android aplikacijama sa servisom na kom stoji model vestacke inteligencije
	- Fajlovi za NodeJS server se mogu naci [ovde](https://github.com/NXTSelfDrivingCar/server/tree/main/src).
- **Python** - Servis koji komunicira sa NodeJS serverom, a na kom se pokrece model vestacke inteligencije.
	- Fajlovi za Python servis se mogu naci [ovde](https://github.com/NXTSelfDrivingCar/server/tree/main/pysrc).

### HTTP komunikacija sa klijentima

Klijentima su omogucena dva nacina komunikacije sa servisom.:
- Kotlin Android aplikacija - Povezivanje sa NXT terminalnom i postavljanje funkcionalnosti kamere
- Veb pretrazivac - Kontrola NXT terminala i prikazivanje video stream-a sa kamere 

Server je najbolje pokrenuti preko [Docker-a](https://github.com/NXTSelfDrivingCar/server/blob/main/docs/Docker.md).

#### Prikaz komunikacije sa klijentima:

![General diagram](https://github.com/NXTSelfDrivingCar/server/blob/main/docs/images/general-diagram.png)

# Pokretanje

Ako se za pokretanje programa ne koristi [Docker](https://github.com/NXTSelfDrivingCar/server/blob/main/docs/Docker.md), potrebno je pokrenuti `httpServer.ts`, upotrebom `npx ts-node` komande.

```ps
npx ts-node .\httpServer.ts
```

Pokretanjem **HTTPServer-a**, uporedo se pokrecu svi potrebni servisi:
- WebSocket server -> Detalje mozete videti [WS - server](https://github.com/NXTSelfDrivingCar/server/blob/main/docs/WebSocket%20-%20Server.md) ili [WS - klijent](https://github.com/NXTSelfDrivingCar/server/blob/main/docs/WebSocket%20-%20Klijent.md)
- NodeMailer server

U slucaju postojanja gresaka, pogledati [[Logging]].

> Ako imate kakva dodatna pitanja ili predloge (koji su i vise nego dobrodosli), slobodno nas kontaktirajte.
