import { LogRepository } from "./logRepository";
import { LogHandler } from "./logHandler";

export class LogController {
    private _repository: LogRepository;

    constructor() {
        this._repository = new LogRepository(LogHandler.filePath.toString());
    }

    getAll(){
        return this._repository.findAll();
    }

    getLogByName(name: string){
        return this._repository.findLogByName(name);
    }

    deleteLogByName(name: string){
        return this._repository.deleteLogByName(name);
    }
}