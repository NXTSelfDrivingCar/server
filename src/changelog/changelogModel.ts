import uuid from 'uuid';

class Changelog{
    id: any;
    title: string;
    version: string;
    isBeta: boolean;
    description: string;
    date: Date = new Date();

    constructor(title: string, version: string, isBeta: boolean = false, description: string, id = uuid.v4){
        this.id = id;
        this.title = title;
        this.version = version;
        this.isBeta = isBeta;
        this.description = description;
    }
}
 
export { Changelog };