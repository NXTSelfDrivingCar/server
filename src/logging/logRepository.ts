import fs, { PathLike } from "fs";
import path from "path";
import _ from "lodash";

export class LogRepository {
    private filePath: PathLike;

    constructor(filePath: PathLike) {
        this.filePath = filePath;
    }

    findLogValueByLevel(name: string, level: string){
        return this.findLogValueByFilter(name, {level: level.toUpperCase()});
    }

    findLogValueByDate(name: string, date: Date){
        return this.findLogValueByFilter(name, {date: date});
    }

    findLogValueByAction(name: string, action: string){
        return this.findLogValueByFilter(name, {action: action});
    }

    async findLogValueByFilter(name: string, filter: any){
        var log = await this.findLogValueByFileName(name);

        return _.filter(log, filter);
    }

    findAllLogFiles(){
        try{
            return fs.readdirSync(this.filePath);
        }catch(err){
            console.log(err);

            return null;
        }
    }

    async findLogValueByFileName(name: string){
        try{
            var data = fs.readFileSync(path.join(this.filePath.toString(), this._parseName(name)));
            return JSON.parse(data.toString());
        }catch(err){
            console.log(err);

            return null;
        }
    }

    deleteLogFileByName(name: string){
        try{
            fs.unlinkSync(path.join(this.filePath.toString(), this._parseName(name)));

            return true;
        }catch(err){
            console.log(err);

            return false;
        }
    }

    

    // ! =================== Private Methods =================== //

    private _parseName(name: string){
        return name.endsWith(".json") ? name : name + ".json";
    }
}