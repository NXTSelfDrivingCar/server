- [[#Opis:|Opis:]]
	- [[#Opis:#Komponente:|Komponente:]]
	- [[#Opis:#Alati:|Alati:]]
- [[#Containers:|Containers:]]
- [[#Images:|Images:]]
		- [[#Alati:#Slike za upotrebu na projektu:|Slike za upotrebu na projektu:]]


## Opis:

Docker je set PaaS (Platform as a Service) proizvoda koji omogućava pokretanje različitih aplikacija na jednom operativnom sistemu, koristeći proces virtuelizacije. 

> NodeJS Docker image se moze pronaci na [antasmes/nxt-server - Docker Image | Docker Hub](https://hub.docker.com/r/antasmes/nxt-server)

![[architecture.svg]]


### Komponente:
- **Software** -> <u>Docker daemon</u> -> Organizuje kontejnere i upravlja objektima u kontejnerima
- **Registries** -> Repozitura za Docker images. Klijent se konektuje na registar i skida `pull` ili kači `push` image.   
- Objekti:
	- [[#Containers:|Container/Kontejner]]
	- [[#Images:|Image/Slika]]
	- Service
- Za detalje pogledati [link](https://www.wikiwand.com/en/Docker_(software)#/Components)

### Alati:
- **Docker Compose** -> Definše i pokreće multi-container aplikacije. Koristi <u>YAML</u> za konfiguraciju aplikacijskih servisa i obavlja kreaciju startnih procesa za sve kontejnere upotrebom jedne komande.
- **Docker Volume** -> Čuva podatke <u>nezavisno</u> od kontejnera, omogućavajući im da postoje iako je kontejner uništen ili kreiran ponovo.
- Za detalje pogledati [link](https://www.wikiwand.com/en/Docker_(software)#/Tools)


## Containers:

Kontejner se standardizovano okruženje koje pokreće aplikaciju. Svaka aplikacija može da dobije svoj poseban kontejner koji pokreće Docker Engine. Upotrebom kontejnera omogućava se korišćenje jedne infrastrukture za pokretanje većeg broja aplikacija sa različitim resursnim zahtevima. Ovaj proces olakšava i prenošenje rešenja sa uređaja na uređaj (u ovome pomažu [[#Images:|slike]]). 

![[Pasted image 20221119213827.png]]

### Volumes:

Volume je prostor na disku, van kontejnera, odnosno na lokalnom fajl sistemu. Postoje dva tipa Volume:
- Docker-Managed -> Kreirani automatski sa docker kontejnerom i korisnik ne moze da bira lokaciju.
- Bind-Mount -> Pokazuju na korisnicki definisano mesto na fajl sistemu

### Upravljanje:

- Za interaktivno upravljanje Docker container-om, koristi se komanda `docker exec -it <container_id> <command>`
	- -it definise interaktivan mod
- Za upravljanje NodeJS kontejnerom po definisanim specifikacijama `dokcer exec -it <container_id> /bin/bash`

## Images:

Docker image je fajl koji se koristi za izvršavanje kooda unutar kontejnera. Image služi kao set instrukcija za kreiranje docker kontejnera. 
Kako je Docker namenjen pokretanju aplikacija unutar kontejnera, image sadrži aplikacioni kood, biblioteke, alate, *dependencies* i sve ostale fajlove potrebne za pokretanje kooda. ([What is a Docker Image?](https://www.techtarget.com/searchitoperations/definition/Docker-image))
- Komanda `docker run` kreira kontejner po šablonu neke specifične slike.
- Za skidanje slike, koristi se komanda `docker pull`

#### Slike za upotrebu na projektu:
- [python](https://hub.docker.com/_/python) -> `docker pull python` - Za pokrenje Python aplikacija
- [mongo](https://hub.docker.com/_/mongo) -> `docker pull mongo` - Za pokretanje MongoDB servera
- [node](https://hub.docker.com/_/node) -> `docker pull node` - Za pokretanje [[Konekcija|node servera]]
- [nxt-server](https://hub.docker.com/r/antasmes/nxt-server) -> `docker pull antasmes/nxt-server` - Za pokretanje citavog NodeJS servisa

### Pokretanje MongoDB:

- Za uspesan rad u MongoDB servisu, potrebno je ugasiti lokalni MongoDB servise (`service-stop "MongoDB"` ili preko prozora Services)

- `docker run --rm --add-host=host.docker.internal:172.17.0.1 -p 27017:27017 --volume c:/mongo/data:/data/db --name mongo mongo`
	- `Run`-> Pokrece postojeci image
	- `--rm`-> Cisti docker fajl sistem
	- `--add-host` -> Dodaje bridge mrezu za pristupanje docker kontejneru
	- `-p` -> Odredjuje port forwarding
	- `--volume` -> Dodeljuje persistant volume na disku gde se podaci cuvaju nakon gasenja kontejnera
		- `c:/mongo/data` -> Lokacija na kojoj ce se podaci iz container-a cuvati na lokalnom FS
		- `/data/db` -> Lokacija iz koje se preuzimaju podaci u container-u.
	- `--name` -> Naziv kontejnera
	- `mongo` -> Komanda koja ce se pokrenuti nakon pokretanja

## Docker-compose:

- Compose sluzi za build vise kontejnera koji su medjusobno zavisni

- `docker-compose build --no-cache` -> Pravi ponovo build za citav compose bez pamcenja prethodnih vrednosti
- `docker-compose up` -> Pokrece kontejnere kreirane u compose fajlu

> Kreirani compose fajl sluzi za povezivanje MongoDB i NXT-Server image-a u jedan servis.

- Docker compose za MongoDB i NXT-Server:

```yml
version: '3.0'

services:
  node:
    container_name: node
    image: antasmes/nxt-server:latest
    #build: .
    volumes:
      - .:/usr/app/
      - /usr/app/node_modules
    working_dir: /app
    command: bash -c "npm install && npx ts-node httpServer.ts"
    ports:
      - "5000:5000"
      - "5001:5001"
    environment:
      - MONGODB_URL=mongodb://host.docker.internal
      - MONGODB_PORT=27017
      - MONGODB_DBATABASE=testDB
      - JWT_SECRET=hocuNoviFont
      - HTTP_SERVER_HOST:localhost
      - HTTP_SERVER_PORT=5000
      - WS_SERVER_HOST=localhost
      - WS_SERVER_PORT=5001
      - B_SALT=9
      - EMAIL_AUTH_USER = <email>
      - EMAIL_AUTH_PASS = <auth>
    depends_on:
      - mongo
    networks:
      - nodeNetwork
  mongo:
    container_name: mongo
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - c:/mongo/data:/data/db
    networks:
      - nodeNetwork
networks:
  nodeNetwork:
    driver: bridge
```
