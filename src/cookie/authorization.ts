import { verify } from "crypto";
import * as jwt from "jsonwebtoken";
// import { getCookie, setCookie, removeCookie } from "typescript-cookie";

import { UserController } from "../user/userController";

import { LogHandler } from "../logging/logHandler";
import { User } from "../user/userModel";
import { Request, Response } from "express";

import { BCryptConfig } from "../config/shared/bcryptConfig";
import { compareSync, hashSync } from "bcrypt";

const userController = new UserController();
const logger = new LogHandler();

var secret: string;
if (!(secret = process.env.JWT_SECRET!!)) { secret = "DobraSifra"; }

export class Authorization {

  // ! =================== PUBLIC FUNCTIONS ===================

  /**
   * Cleares cookie with given name
   * @param cookieName Name of cookie to be cleared
   * @param res Response object
   */
  public static clearCookie(cookieName: string, res: Response): void {
    res.clearCookie(cookieName);
  }

  /**
   * Decodes JWT Token and returns decoded data
   * @param token JWT Token to be decoded
   * @returns Decoded data from token
   */
  public static getDataFromToken(token: string): any{
    return Authorization._decodeToken(token);
  }

  /**
   * Gets cookie with given name and decodes it to get data
   * @param cookieName Name of cookie to be decoded
   * @param req request object
   * @returns 
   */
  public static getDataFromCookieName(cookieName: string, req: Request): any {
    var token = req.cookies[cookieName];
    var decoded = Authorization._verifyToken(token);
    return decoded;
  }

  /**
   * Returns user object from JWT Token
   * @param token JWT Token to be decoded
   * @returns User object from token or null if token is invalid
   */
  public static async getUserFromToken(token: string): Promise<User | null> {
    return await this._getUserFromToken(token);
  }

  /**
   * 
   * @param token JWT Token to be decoded
   * @returns User ID from token or null if token is invalid
   * @deprecated Use getUserFromToken instead
   */
  public static getUserIDFromToken(token: string): any {
    var decoded = this._verifyToken(token);
    if (decoded) {
      return decoded;
    }
    return null;
  }

  /**
   * 
   * @param cookieName Name of cookie to be decoded
   * @param req request object
   * @returns User object from cookie or User(guest) if cookie is invalid or the user does not exist
   */
  public static async getUserFromCookie(cookieName: string, req: Request): Promise<User | null> {
    if(!req.cookies[cookieName]) {
      return new User("guest", "guest", "guest", "guest", "guest", "guest");
    }

    return await this._getUserFromToken(req.cookies[cookieName]);
  }

  /**
   * Signs token with given user ID and sets it as cookie
   * @param userId ID of user to be signed as token
   * @param res  Response object
   * @param req  Request object
   * @returns  JWT Token
   */
  public static signToken(userId: string, res: Response, req: Request): any  {
    return this._signToken(userId, res, req);
  }

  /**
   * This function is used to check if user is logged in or posses one of the given roles and then continue with the request
   * @param roles Roles to be checked
   * @returns Middleware function that checks if user has one of the given roles
   * @example
   * app.get("/admin", Authorization.authRole("admin"), (req, res) => { ... });
   * app.get("/mdoerator", Authorization.authRole("admin", "moderator"), (req, res) => { ... });
   */
  public static authRole(...roles: string[]) {
    return (req: Request, res: Response, next: any) => {
      this._authRole(roles, req, res, next);
    }
  }


  public static async authorizeSocket(socket: any, cookieName: string, disconnect: boolean = true, ...roles: string[]): Promise<boolean> {
    // Get user from cookie, if user is null, disconnect socket (if disconnect is true)

    var token = this.getTokenFromWS(socket, cookieName);
    var user = await this._getUserFromToken(token);
    
    // If user is null (guest), disconnect socket
    if(!user || user.role == "guest") {
      
      logger.warn({origin: "WebSocket", action: "authorization", message: "User is not logged in", socket: {id: socket.id, requestUrl: socket.request.url}})

      if(disconnect) { socket.disconnect(); }
      return false;
    }

    // Check if user has one of the given roles
    for (var role in roles){
      if(user.role == roles[role]) {
        return true;
      }
    }

    logger.warn({origin: "WebSocket", 
      action: "authorization", 
      message: "Unauthorized", 
      roles: roles, 
      socket: socket.id,
      user: {id: user.id, username: user.username, role: user.role}})

    return false;
  }


  public static getTokenFromWS(socket: any, cookieName: string): string {
    try{
      // Get cookie from socket request ( "auth=token; ")
      var cookies = socket.request.headers.cookie.split("; ");
    }catch(err){
      return "";
    }

    for (var cookie in cookies){
      if(cookies[cookie].startsWith(cookieName)){
        return cookies[cookie].split("=")[1];
      }
    }
    return "";
  }


  public static getTokenFromCookieString(cookieString: string, cookieName: string): string{
    var cookies = cookieString.split("; ");
    for (var cookie in cookies){
      if(cookies[cookie].startsWith(cookieName)){
        return cookies[cookie].split("=")[1];
      }
    }
    return "";
  }

  public static authUser(redirectPage: string = "") {
    return (req: Request, res: Response, next: any) => { 
      return this._authUser(redirectPage, req, res, next);
    }
   
}
  
  // ! =================== PRIVATE FUNCTIONS ===================

  private static async _authUser(redirectPage: string, req: Request, res: Response, next: any): Promise<void> {
      if (!req.body.password) { res.redirect(redirectPage); return; }

      var data = Authorization.getDataFromCookieName("auth", req);
      
      if(!data){ 
        res.redirect((redirectPage == "") ? req.headers.referer || "/" : redirectPage);
        return;
       }
  
      if(!data.userId){ 
        res.redirect((redirectPage == "") ? req.headers.referer || "/" : redirectPage);
        return; 
      }
  
      var user = await userController.findUserById(data.userId);
      
      if(!user){ 
        res.redirect((redirectPage == "") ? req.headers.referer || "/" : redirectPage);
        return;
      }
  
      if(!await compareSync(req.body.password.toString(), user.password)){ 
        res.redirect((redirectPage == "") ? req.headers.referer || "/" : redirectPage);
        return;
      }
  
      next();
      return;
  }

  private static async _authRole(roles: string[], req: Request, res: Response, next: any): Promise<void> {

    // Get user from cookie
    var user = await Authorization.getUserFromCookie("auth", req);

    // If user is null, redirect to login
    if(!user || user.role == "guest") {
      logger.warn({origin: "HttpServer", action: "authorization", message: "User is not logged in", request: {url: req.url, method: req.method}})
      res.redirect("/login");
      return;
    }

    // Check if user has one of the given roles
    for (var role in roles){
      if(user.role == roles[role]) {
        // If user has one of the given roles, continue with the request
        next();
        return;
      }
    }

    logger.warn({origin: "HttpServer", 
      action: "authorization",
      message: "Unauthorized",
      roles: roles,
      user: {id: user.id, username: user.username, role: user.role},
      request: {url: req.url, method: req.method, ip: req.ip}})

    // If user does not have one of the given roles, redirect to login
    res.redirect("/login");
    return;
  }


  private static async _getUserFromToken(token: string): Promise<any> {
    // Decode token and verify it
    var decoded = this._verifyToken(token);

    // If token is invalid, return guest user
    if (decoded == null) {
      logger.warn({origin: "Authorization", action: "getUserFromToken", message: "Invalid token", token: token});
      return new User("guest", "guest", "guest", "guest", "guest", "guest");
    }

    // Find user with given ID
    try{
      // TODO: Paziti u slucaju da se doda jos neki token koji ne sadrzi userId
      var user = await userController.findUserById(decoded.userId);

      // If user does not exist, return guest user
      if(user == null) {
        logger.warn({origin: "Authorization", action: "getUserFromToken", message: "User does not exist", token: token});
        return new User("guest", "guest", "guest", "guest", "guest", "guest");
      }

      return user;
    }
    catch (err) {
      logger.error({origin: "Authorization", action: "getUserFromToken", message: "Error while getting user from token", token: token})
    }

    logger.warn({origin: "Authorization", action: "getUserFromToken", message: "User does not exist", token: token});
    return new User("guest", "guest", "guest", "guest", "guest", "guest");
  }


  private static _verifyToken(token: string): any {
    try{
      return jwt.verify(token, secret);
    }
    catch (err) {
      return null;
    }
  }


  private static _signToken(userId: string, res: Response, req: Request): any {
    // Sign token with given user ID that expires in 1 hour
    const token = jwt.sign({ userId: userId }, secret, {expiresIn: '1h'});

    // Set cookie with given token
    res.cookie('auth', token, { httpOnly: true, secure: true});
    return token;
  }


  private static _decodeToken(token: string): any {
    return jwt.decode(token);
  }

}