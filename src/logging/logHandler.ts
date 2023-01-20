import path from "path";
import fs, { PathLike } from "fs";
import { Request, Response } from "express";

const statuses = { OPEN: "OPEN", CLOSED: "CLOSED" };
const tags = { INFO: "INFO", ERROR: "ERROR", WARN: "WARNING" };
const fileName = `log_${Date.now()}.json`;

/**
 * LogHandler class for logging data to a file in the logs directory 
 * @class LogHandler 
 * @property {PathLike} filePath - The path to the logs directory
 * @property {PathLike} currentFile - The path to the current log file
 * @property {string} status - The status of the log file
 * 
 * @method open - Opens a new log file
 * @method close - Closes the current log file
 * @method log - Logs data to the current log file
 * @method error - Logs data to the current log file with the ERROR tag
 * @method warn - Logs data to the current log file with the WARNING tag
 * @method logRoute - Logs data to the current log file with the INFO tag and the route action
 * @method getFileName - Returns the name of the current log file
 * 
 * @constructor - Creates a new LogHandler instance
 * 
 * @example
 * const logger = new LogHandler();
 * 
 * logger.log({message: "Hello World!"})
 * logger.error({message: "Hello World!"})
 * logger.warn({message: "Hello World!"})
 * 
 */
class LogHandler{
    static currentFile: PathLike = "";
    static status = statuses.CLOSED;

    filePath: PathLike;

    constructor(){
        this.filePath = path.join(__dirname, "..", "logs");

        this.open();
    }
    
    open(){
        if(LogHandler.status == statuses.OPEN){
            return;
        }

        this._prepareDir();

        LogHandler.currentFile = path.join(this.filePath.toString(), fileName);
        LogHandler.status = statuses.OPEN;

        this._writeOpener();
    }

    /**
     * Close the current log file 
     * 
     * @returns {void} 
     */
    close(): void{
        if(LogHandler.status == statuses.CLOSED){
            return;
        }

        LogHandler.status = statuses.CLOSED;
        LogHandler.currentFile = "";
    }

    /**
     * Logs data to the current log file
     * 
     * @param data - The data to log
     * @returns {void}
     * 
     * @example
     * logger.log({message: "Hello World!"})
     * 
     * // Output:
     * // {
     * //     "tag": "INFO",
     * //     "timestamp": 123456789,
     * //     "message": "Hello World!"
     * // }
     * 
     * logger.log({message: "Hello World!", tag: "CUSTOM_TAG"})
     * 
     * // Output:
     * // {
     * //     "tag": "CUSTOM_TAG",
     * //     "timestamp": 123456789,
     * //     "message": "Hello World!"
     * // }
     * 
     * logger.log({message: "Hello World!", timestamp: 123456789})
     * 
     * // Output:
     * // {
     * //     "tag": "INFO",
     * //     "timestamp": 123456789,
     * //     "message": "Hello World!"
     * // }
     * 
     * logger.log({message: "Hello World!", tag: "CUSTOM_TAG", timestamp: 123456789})
     * 
     * // Output:
     * // {
     * //     "tag": "CUSTOM_TAG",
     * //     "timestamp": 123456789,
     * //     "message": "Hello World!"
     * // }
     * 
     * logger.log({message: "Hello World!", tag: "CUSTOM_TAG", timestamp: 123456789, extra: "extra data"})
     * 
     * // Output:
     * // {
     * //     "tag": "CUSTOM_TAG",
     * //     "timestamp": 123456789,
     * //     "message": "Hello World!",
     * //     "extra": "extra data"
     * // }
     * 
     */
    log(data: any){
        this._log(tags.INFO, data);
    }
    
    /**
     * 
     * @param data - The data to log
     * @returns {void}
     * 
     * @example
     * logger.error({message: "Hello World!"})
     * 
     * // Output:
     * // {
     * //     "tag": "ERROR",
     * //     "timestamp": 123456789,
     * //     "message": "Hello World!"
     * // }
     * 
     * logger.error({message: "Hello World!", tag: "CUSTOM_TAG"})
     * 
     * // Output:
     * // {
     * //     "tag": "CUSTOM_TAG",
     * //     "timestamp": 123456789,
     * //     "message": "Hello World!"
     * // }
     * 
     * logger.error({message: "Hello World!", timestamp: 123456789})
     * 
     * // Output:
     * // {
     * //     "tag": "ERROR",
     * //     "timestamp": 123456789,
     * //     "message": "Hello World!"
     * // }
     * 
     * logger.error({message: "Hello World!", tag: "CUSTOM_TAG", timestamp: 123456789})
     * 
     * // Output:
     * // {
     * //     "tag": "CUSTOM_TAG",
     * //     "timestamp": 123456789,
     * //     "message": "Hello World!"
     * // }
     * 
     * logger.error({message: "Hello World!", tag: "CUSTOM_TAG", timestamp: 123456789, extra: "extra data"})
     * 
     * // Output:
     * // {
     * //     "tag": "CUSTOM_TAG",
     * //     "timestamp": 123456789,
     * //     "message": "Hello World!",
     * //     "extra": "extra data"
     * // }
     * 
     */
    error(data: any){
        this._log(tags.ERROR, data);
    }

    /**
     * 
     * @param data - The data to log
     * @returns {void}
     * 
     * @example
     * logger.warn({message: "Hello World!"})
     * 
     * // Output:
     * // {
     * //     "tag": "WARN",
     * //     "timestamp": 123456789,
     * //     "message": "Hello World!"
     * // }
     * 
     * logger.warn({message: "Hello World!", tag: "CUSTOM_TAG"})
     * 
     * // Output:
     * // {
     * //     "tag": "CUSTOM_TAG",
     * //     "timestamp": 123456789,
     * //     "message": "Hello World!"
     * // }
     * 
     */
    warn(data: any){
        this._log(tags.WARN, data);
    }

    /**
     * 
     * @param action - The action to log
     * @returns {Function} - The middleware function
     * 
     * @example
     * app.get("/test", logger.logRoute("getTesting"), (req, res) => {
     *    res.send("Hello World!");
     * });
     * 
     * // Output:
     * // {
     * //     "tag": "INFO",
     * //     "timestamp": 123456789,
     * //     "action": "getTesting",
     * //     "method": "GET",
     * //     "url": "/test",
     * // }
     * 
     */
    logRoute(action: string, extra: any = {}) {
        return (req: Request, res: Response, next: any) => {
            this._logRoute(req, res, action, extra);
            next();
        }
    }

    getFileName(): string{
        return LogHandler.currentFile.toString().split("\\")[LogHandler.currentFile.toString().split("\\").length - 1];
    }

    // ! =================== PRIVATE METHODS =================== //

    private _log(tag: string = tags.INFO, data: any){

        var timestamp = new Date().getTime();

        // If tag is not set, set it
        if(!data["tag"]) data["tag"] = tag;
        
        // If timestamp is not set, set it
        if(!data["timestamp"]) data["timestamp"] = timestamp;

        data["tag"] = data["tag"].toUpperCase();

        var currentLog = fs.readFileSync(LogHandler.currentFile, "utf8");

        var currentLogJSON = JSON.parse(currentLog);

        currentLogJSON.push(data);

        this._writeToFile(currentLogJSON);
    } 

    private _prepareDir(){
        console.log("Checking for log directory...");
        if(fs.existsSync(this.filePath)) return;

        console.log("Creating log directory...");
        fs.mkdirSync(this.filePath);

        console.log("Log directory created at: " + this.filePath);
    }

    private _writeToFile(data: any){
        // Check if directory exists and create it if it doesn't
        if(LogHandler.status == statuses.CLOSED){
            this.open();
        }
        try{
            fs.writeFileSync(LogHandler.currentFile, JSON.stringify(data, null, 2));
        }
        catch(err){
            console.log("No log file found");
        }
    }

    // ! =================== LOGGING WRAPPERS =================== //

    private _writeOpener(){

        var starter = [
            {
                timestamp: new Date().getTime(),
                tag: tags.INFO,
                source: "internal_log",
                action: "open",
                message: "Log file opened",
                logName: this.getFileName(),
            },
        ];

        this._writeToFile(starter);
    }

    private _logRoute(req: Request, res: Response, action: string, extra: any = {}){

        var logData: any = {
            action: action,
            method: req.method,
            url: req.url,
        }

        if(JSON.stringify(extra) !== "{}") logData["content"] = extra;

        if (JSON.stringify(req.body) !== "{}") logData["body"] = req.body;

        if (JSON.stringify(req.query) !== "{}") logData["query"] = req.query;

        this.log(logData);
    }
}

export { LogHandler, statuses, tags };