import fs, { PathLike } from "fs";
import path from "path";

export class LogRepository {
    private filePath: PathLike;

    constructor(filePath: PathLike) {
        this.filePath = filePath;
    }

    findAll(){
        return fs.readdirSync(this.filePath);
    }

    findLogByName(name: string){
        return fs.readFileSync(path.join(this.filePath.toString(), name));
    }

    deleteLogByName(name: string){
        return fs.unlinkSync(path.join(this.filePath.toString(), name));
    }
}