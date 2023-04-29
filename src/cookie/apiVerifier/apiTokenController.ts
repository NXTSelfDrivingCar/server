import { ApiTokenRepository } from "./apiTokenRepository";
import { ApiToken } from "./apiTokenModel";
import { LogHandler } from "../../logging/logHandler";
import { Request, Response } from "express";

// import { Authorization } from "../cookie/authorization";

const logger = new LogHandler();
const API_TOKENS_COLLECTION = "apiTokens";

export class ApitokenController {
    private _apiTokenRepository: ApiTokenRepository;

    constructor() {
        this._apiTokenRepository = new ApiTokenRepository(API_TOKENS_COLLECTION);
    }

    public async findTokenById(id: string): Promise<any> {
        return await this._apiTokenRepository.findTokenById(id);
    }

    public async findTokenByRequiredFields(tokenId: string, userId: string, pageKey: string): Promise<any> {
        return await this._apiTokenRepository.findTokenByRequiredFields(tokenId, userId, pageKey);
    }

    public async findTokenByUserId(userId: string): Promise<any> {
        return await this._apiTokenRepository.findTokenByUserId(userId);
    }

    public async insert(document: ApiToken): Promise<any> {
        return await this._apiTokenRepository.insert(document);
    }

    public async delete(id: string): Promise<any> {
        return await this._apiTokenRepository.delete(id);
    }


}
