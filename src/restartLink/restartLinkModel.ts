const DOMAIN = "http://localhost:5000"

export class RestartLink{
    
    link: string;
    id: string;

    date: Date;

    constructor(userId: string){
        this.id = userId;
        this.link = this.generateLink(userId);

        this.date = new Date();
    }

    public static handleLink(link: string): string{
        if(!link.includes(DOMAIN)) return DOMAIN + link;
        return link;
    }

    public getLink(): string{
        return this.link;
    }

    public getUserId(): string{
        return this.id;
    }

    private generateLink(userId: string){
        var randomPart = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return `${DOMAIN}/reset/${userId}/${randomPart}`;
    }

}