# Opis

`MongoRepository<T>` je apstraktna klasa koja sadrzi osnovne funkcije i konstruktore za povezivanje servera sa MongoDB bazom podataka.

- Svaka klasa koja se povezuje sa MongoDB bi trebala da nasledjuje `MongoRepository` klasu.

# Inicijalizacija

Za povezivanje sa bazom podataka i pretrazivanjem kolekcija, koristimo `mongodb` biblioteku.
Za cuvanje konekcionih stringova za bazu podataka, koristimo `MongoConfig` klasu koja povlaci podatke iz `.env` fajla

```js
import { Collection, Db, MongoClient } from "mongodb";
import { MongoConfig } from "./mongoConfig";
```

## Konstruktor

```js
abstract class MongoRepository<T>{
	constructor(collectionName: string) {
		this._client = new MongoClient(MongoConfig.CONNECTION);
		this._collectionName = collectionName;
	}
}
```

Konstruktor klase uzima samo naziv kolekcije iz koje ce povlaciti podatke. Pozivom konstruktora definise se i klijent za povezivanje sa bazom podataka.

## Funkcije

Lista funkcija u klasi `MongoRepository<T>`
- `async _isConnected(): Promise<Boolean>` => Proverava da li je ostvarena aktivna veza sa bazom podataka
- `abstract insert(document: T): Promise<any>`
- `abstract findAll(): Promise<any>`
- `abstract delete(id: string): Promise<any>`

### Provera konekcije

Provera konekcije sa MongoDB vrsi se u izvedenoj klasi pre svakog izvrsavanja upita nad bazom, upotrebom funkcije `_isConnected()`.

```js
protected async _isConnected(): Promise<boolean> {
        try
        {
            await this._client!!.connect();
            this._db = this._client!!.db(MongoConfig.DATABASE);
            this._collection = this._db!!.collection(this._collectionName);

            return true
        }
        catch(err)
        {
            this.logData.method = "_isConnected";
            this.logData.error = err;
            logger.error(this.logData)

            return false;
        }
    }
```

Funckija proverava da li _MongoDB Client_ moze da se poveze sa definisanim kredidencijalima. `MongoRepository` podesava `_db` i `_collection` na potrebne vrednosti.

```js
public async delete(id: string): Promise<any> {

	// Provera konekcije sa bazom podataka
	if (!await this._isConnected()) return null;

	try {
		return await this._collection!!.deleteOne({ id: id });
	}
	catch (err) {
		return null;
	}
}
```


### FindDocumentByFilter

`_findDocumentByFilter` funkcija vraca vrednost dokumenta iz kolekcije po bilo kom <u>JSON</u> filteru. 

> Ova funkcija se nalazi u svakoj izvedenoj klasi ( plan je prebaciti je u abstraktnu klasu radi cistijeg kooda )

```js
class UserRepository extends MongoRepository<User> {
	private async _findUsersByFilter(filter: any, limit: number = 0): Promise<Array<any>>
	...
}
```

- Primer upotrebe `_findUsersByFilter`

```js
public async findUserById(id: string): Promise<any> {
	return (await this._findUsersByFilter({ id: id }))[0];
}
```
