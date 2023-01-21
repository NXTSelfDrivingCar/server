import { UserRepository } from "./userRepository";
import { User } from "./userModel";
import { LogHandler } from "../logging/logHandler";

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
}