import { v4 } from 'uuid';

const uuid = v4();

class Changelog{
    id: any;
    title: string;
    version: string;
    isBeta: boolean;
    description: string;
    date: Date = new Date();

    constructor(title: string, version: string, isBeta: boolean = false, description: string, id = uuid){
        this.id = id;
        this.title = title;
        this.version = version;
        this.isBeta = isBeta;
        this.description = description;
    }
}
 
export { Changelog };