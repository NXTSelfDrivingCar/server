import { Application, Request, Response } from "express";
import { LogHandler } from "../logging/logHandler";

const logger = new LogHandler();

module.exports = function(app: Application) {

    // ! =================== GET ROUTES =================== //

    app.get("/user/logout", logger.logRoute("logout"), (req: Request, res: Response) => {
        res.send("Logout page")

        // clear token from cookies
        // redirect to /
    })

    app.get("/user/profile",logger.logRoute("getProfile"), (req: Request, res: Response) => {
        res.send("Profile page")

        // render the profile page
    })

    // ! =================== POST ROUTES =================== //

    app.post("/user/update", logger.logRoute("postUpdate"), (req: Request, res: Response) => {
        res.send("Update user")

        // update user
        // redirect to /user/profile
    })

    // ! =================== DELETE ROUTES =================== //

    app.delete("/user/delete", logger.logRoute("deleteUser"), (req: Request, res: Response) => {
        res.send("Delete user")

        // delete user
        // redirect to /
    })

    /*
   *==========================================================================
   *==========================================================================
   *============================= MOBILE ROUTES ==============================
   *==========================================================================
   *==========================================================================
   */

    // ! =================== POST ROUTES =================== //

    app.post("/user/login/mobile", logger.logRoute("mobileLogin"), (req: Request, res: Response) => {
        res.send("Login page")

        // Login user
        // return status OK if login success and token
        // return status UNAUTHORIZED if login failed
        // return status BAD_REQUEST if request is invalid
        // return status INTERNAL_SERVER_ERROR if something went wrong
    })

    app.post("/user/register/mobile", logger.logRoute("mobileRegister"), (req: Request, res: Response) => {
        res.send("Register page")

        // Register user
        // return status OK if register success
        // return status BAD_REQUEST if request is invalid
        // return status INTERNAL_SERVER_ERROR if something went wrong
    })

    app.post("/user/update/mobile", logger.logRoute("mobileUpdate"), (req: Request, res: Response) => {
        res.send("Update user")

        // Update user
        // return status OK if update success
        // return status BAD_REQUEST if request is invalid
        // return status INTERNAL_SERVER_ERROR if something went wrong
    })

    // TODO: Add mobile route for delete user (DELETE)
    app.post("/user/delete/mobile", (req: Request, res: Response) => {
        res.send("Delete user")

        // Delete user
        // return status OK if delete success
        // return status BAD_REQUEST if request is invalid
        // return status INTERNAL_SERVER_ERROR if something went wrong
    })
}