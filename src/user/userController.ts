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


    /**
     * User update function that does not require authentication
     * @param id User ID to update
     * @param updates Object containing updates to user
     * @returns {status: "updateComplete" | "userNotFound", user: User}
     */
    public async updateUser(id: string, updates: any, forceId: boolean = false): Promise<any> {

         // If new username is taken, return error
         if(updates.username){
            var existing: User = await this._userRepository.findUserByUsername(updates.username);
            var user: User = await this._userRepository.findUserById(id);

            if(existing && user.username !== updates.username){
                return {status: "usernameTaken", user: null};
            }
        }

        // If new password is provided, hash it
        if(updates.password){
            updates.password = await hashSync(updates.password, BCryptConfig.SALT);
        }

        // If forceId is false, remove the ID from the updates
        if(!forceId){ delete updates.id; }

        var updatedUser = await this._userRepository.updateUser(id, updates);

        return {status: "updateComplete", user: updatedUser}
    }


    /**
     * Delete user function that does not require authentication
     * @param id User ID to delete
     */
    public async deleteUser(id: string): Promise<any> {
        return await this._userRepository.delete(id);
    }


    public async insertUser(user: User): Promise<any> {
        return await this._userRepository.insert(user);
    }


    public async findAllUsers(): Promise<any> {
        return await this._userRepository.findAll();
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


    /**
     * User registration function
     * @param user User object to register
     * @returns {status: "registrationComplete" | "usernameTaken", user: User}
     */
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


    /**
     * User update function that requires authentication
     * @param id User ID to update
     * @param updates Object containing updates to user
     * @param currentPassword Current password of user to authenticate update
     * @param forceId If true, will force the ID to be updated. If false, will remove the ID from the updates object.
     * @returns {status: "updateComplete" | "userNotFound" | "passwordIncorrect" | "usernameTaken", user: User}
     */
    public async updateUserAuth(id: string, updates: any, currentPassword: string, forceId: boolean = false): Promise<any> {
        // If current password is not provided, return error
        if(!currentPassword) { return {status: "passwordRequired", user: null}; }

        var currentUser = await this._userRepository.findUserById(id);

        // If user is not found, return error
        if(!currentUser){
            return {status: "userNotFound", user: null};
        }

        // If current password is incorrect, return error
        if(!await compareSync(currentPassword, currentUser.password)){
            return {status: "passwordIncorrect", user: null};
        }

        return await this.updateUser(id, updates, forceId);
    }


    /**
     * User deletion with password authentication. Returns status of deletion.
     * @param id Id of user to delete
     * @param password Password of user to authenticate deletion
     * @returns {status: "userDeleted" | "userNotFound" | "passwordIncorrect" | "userDeleteFailed"}
     */
    public async deleteUserAuth(id: string, password: string): Promise<any> {
        var user = await this._userRepository.findUserById(id);

        // If user is not found, return error
        if(!user){ return {status: "userNotFound"}; }

        // If password is incorrect, return error
        if(! await compareSync(password, user.password)){ return {status: "passwordIncorrect"}; }

        // Delete user
        try{
            await this._userRepository.delete(id);
            return {status: "userDeleted"};
        }
        catch(err){
            return {status: "userDeleteFailed"};
        }
    }
    
}
