import * as jwt from "jsonwebtoken";
import { getCookie, setCookie, removeCookie } from "typescript-cookie";

import { LogHandler } from "../logging/logHandler";
import { User } from "../user/userModel";

var secret: string;
if (!(secret = process.env.JWT_SECRET!!)) { secret = "DobraSifra"; }

export class Authorization {
  public static async getAuthCookie() {
    return getCookie('auth')
  }

  public static async removeAuthCookie() {
    removeCookie('auth')
  }

  // ? Nece li ovo biti ID umesto username?
  public static async logInCookie(userId: string) {
    var signed = jwt.sign(userId, secret);

    setCookie('auth', signed, { expire: 1/24 });
  }

  public static async getDecodedFromToken() {
    if (getCookie('auth')) {
      var decoded = jwt.verify(getCookie('auth')!!, secret);
  
      if (decoded) {
        return { status: "OK", decoded: decoded };
      }else{
        return { status: "InvalidToken", decoded: null };
      }
    }else{
      return { status: "NoCookie", decoded: null };
    }
  }
}