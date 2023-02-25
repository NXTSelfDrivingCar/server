import { UserController } from "../user/userController";
import { RestartLinkRepository } from "./restartLinkRepository";

import { RestartLink } from "./restartLinkModel";

const RESTART_LINK_COLLECTION = "restartLinks";

export class RestartLinkController {
    
    private _restartLinkRepository: RestartLinkRepository;
    private _userController: UserController;

    // 2 hours
    private linkExpirationTime = 7200000;
    
    constructor() {
        this._restartLinkRepository = new RestartLinkRepository(RESTART_LINK_COLLECTION);
        this._userController = new UserController();
    }

    public async createRestartLink(username: string): Promise<any> {
        var user = await this._userController.findUserByFilter({ username: username });

        if(user == null) return { status: "userNotFound"};

        var restartLink = new RestartLink(user.id);

        var link = await this._restartLinkRepository.findLinkById(user.id);

        if(link){
            await this._restartLinkRepository.delete(user.id);
        }

        return await this._restartLinkRepository.insert(restartLink);
    }

    public async getRestartLink(userId: string): Promise<any> {
        return await this._restartLinkRepository.findLinkById(userId);
    }

    public async getRestartLinkByObjectId(objectId: any): Promise<any> {
        return await this._restartLinkRepository.findLinkByObjectId(objectId);
    }

    public async deleteRestartLink(userId: string): Promise<any> {
        return await this._restartLinkRepository.delete(userId);
    }

    public async isLinkExpired(link: RestartLink): Promise<boolean> {
        var now = new Date();

        if(now.getTime() - link.date.getTime() > this.linkExpirationTime) return true;

        return false;
    }

    public async checkLink(userId: string, link: string): Promise<boolean> {
        var restartLink = await this._restartLinkRepository.findLinkById(userId);

        if(restartLink == null) return false;

        if(await this.isLinkExpired(restartLink)) {
            this._restartLinkRepository.delete(userId);
            return false;
        }

        link = RestartLink.handleLink(link);

        if(restartLink.link == link) return true;

        return false;
    }
}