import { UserRepository } from "./userRepository";
import { User } from "./userModel";
import { LogHandler } from "../logging/logHandler";
import { BCryptConfig } from "../config/shared/bcryptConfig";
import { compareSync, hashSync } from "bcrypt";
import { Request, Response } from "express";
import { Authorization } from "../cookie/authorization";

// import { Authorization } from "../cookie/authorization";

const logger = new LogHandler();
const USERS_COLLECTION = "users";

export class UserController {
    private _userRepository: UserRepository;

    constructor() {
        this._userRepository = new UserRepository(USERS_COLLECTION);
    }

    public async insertUser(user: User): Promise<any> {
        return await this._userRepository.insert(user);
    }

    public async findAllUsers(): Promise<any> {
        return await this._userRepository.findAll();
    }

    public async deleteUser(id: string): Promise<any> {
        return await this._userRepository.delete(id);
    }

    public async updateUser(id: string, updates: any): Promise<any> {
        return await this._userRepository.updateUser(id, updates);
    }

    public async findUserById(id: string): Promise<any> {
        return await this._userRepository.findUserById(id);
    }

    public async findUsersByFilter(filter: any): Promise<any> {
        return await this._userRepository.findUsersByFilter(filter);
    }

    public async findUserByFilter(filter: any): Promise<any> {
        return await this._userRepository.findUserByFilter(filter);
    }

    public async login(username: string, password: string, req: Request, res: Response): Promise<any>{
        var user: User = await this._userRepository.findUserByUsername(username)
        
        if(!user){
            return {status: "loginFailed", user: null};
        }

        if(await compareSync(password, user.password)){

            var token = Authorization.signToken(user.id, res, req);

            return {status: "loginComplete", user: user};
        }

        return {status: "loginFailed", user: null};
    }

    public async register(user: User): Promise<any>{
        var existing: User = await this._userRepository.findUserByUsername(user.username);

        if(existing){
            return {status: "usernameTaken", user: null};
        }

        user.password = await hashSync(user.password, BCryptConfig.SALT);

        var newUser = await this._userRepository.insert(user);

        if(newUser){
            return {status: "registrationComplete", user: newUser};
        }

        return {status: "registrationFailed", user: null};
    }
}
