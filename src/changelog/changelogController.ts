import { ChangelogRepository } from "./changelogRepository";
import { Changelog } from "./changelogModel";
import { LogHandler } from "../logging/logHandler";

const logger = new LogHandler();
const CHANGELOG_COLLECTION = "changelogs";

export class ChangelogController{
    private _changelogRepository: ChangelogRepository;

    constructor(){
        this._changelogRepository = new ChangelogRepository(CHANGELOG_COLLECTION);
    }

    public async getChangelogs(): Promise<Changelog[]>{
        return await this._changelogRepository.findAll();
    }

    public async createChangelog(changelog: Changelog): Promise<any>{
        return await this._changelogRepository.insert(changelog);
    }

    public async getChangelogsByDate(date: Date): Promise<Changelog[]>{ 
        return await this._changelogRepository.findChangelogsByDate(date);
    }

    public async getChangelogsByVersion(version: string): Promise<Changelog[]>{
        return await this._changelogRepository.findChangelogsByVersion(version);
    }

    public async getLatestChangelogs(limit = 0): Promise<Changelog[]>{ 
        return await this._changelogRepository.findLatest(limit);
    }
}