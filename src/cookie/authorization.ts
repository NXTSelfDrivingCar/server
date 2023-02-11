import { verify } from "crypto";
import * as jwt from "jsonwebtoken";
// import { getCookie, setCookie, removeCookie } from "typescript-cookie";

import { UserController } from "../user/userController";

import { LogHandler } from "../logging/logHandler";
import { User } from "../user/userModel";
import { Request, Response } from "express";

const userController = new UserController();

var secret: string;
if (!(secret = process.env.JWT_SECRET!!)) { secret = "DobraSifra"; }

export class Authorization {

  public static clearCookie(cookieName: string, res: Response): void {
    res.clearCookie(cookieName);
  }

  public static getDataFromToken(token: string): any{
    return Authorization._decodeToken(token);
  }

  public static getDataFromCookieName(cookieName: string, req: Request): any {
    var token = req.cookies[cookieName];
    var decoded = Authorization._decodeToken(token);
    return decoded;
  }

  public static async getUserFromToken(token: string): Promise<User | null> {
    return await this._getUserFromToken(token);
  }

  public static getUserIDFromToken(token: string): any {
    var decoded = this._verifyToken(token);
    if (decoded) {
      return decoded;
    }
    return null;
  }

  public static async getUserFromCookie(cookieName: string, req: Request): Promise<User | null> {
    if(!req.cookies[cookieName]) {
      return new User("guest", "guest", "guest", "guest", "guest", "guest");
    }

    return await this._getUserFromToken(req.cookies[cookieName]);
  }

  public static signToken(userId: string, res: Response, req: Request): any  {
    return this._signToken(userId, res, req);
  }

  public static async authRole(role: string, req: Request, res: Response, next: any): Promise<void> {
    var user = await Authorization.getUserFromCookie("auth", req);

    if(user == null) {
      res.status(404).send("Not found");
      return;
    }

    if(user.role != role) {
      res.status(404).send("Not found");
      return;
    }

    next();
  }
  
  // ! =================== PRIVATE FUNCTIONS ===================

  private static async _getUserFromToken(token: string): Promise<any> {
    var decoded = this._verifyToken(token);
    if (decoded == null) {
      return new User("guest", "guest", "guest", "guest", "guest", "guest");
    }

    console.log(decoded);

    try{
      var user = await userController.findUserById(decoded.userId);

      console.log(user);

      if(user == null) {
        return new User("guest", "guest", "guest", "guest", "guest", "guest");
      }

      return user;
    }
    catch (err) {
      console.log(err);
    }

    return new User("guest", "guest", "guest", "guest", "guest", "guest");
  }


  private static _verifyToken(token: string): any {
    return jwt.verify(token, secret);
  }

  private static _signToken(userId: string, res: Response, req: Request): any {
    const token = jwt.sign({ userId: userId }, secret, {expiresIn: '1h'});

    res.cookie('auth', token, { httpOnly: true, secure: true});
    return token;
  }

  private static _decodeToken(token: string): any {
    return jwt.decode(token);
  }

}