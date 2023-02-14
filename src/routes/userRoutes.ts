import { Application, Request, Response } from "express";
import { Authorization } from "../cookie/authorization";
import { LogHandler } from "../logging/logHandler";
import { UserController } from "../user/userController";
import { User } from "../user/userModel";

const logger = new LogHandler();
const userController = new UserController();

/*
*
*==========================================================================
*==========================================================================
*============================= MODULE EXPORTS =============================
*==========================================================================
*==========================================================================
*
*/

module.exports = function(app: Application) {

    // ! =================== GET ROUTES =================== //

    app.get("/logout", logger.logRoute("logout"), (req: Request, res: Response) => {
        Authorization.clearCookie("auth", res);
        
        res.redirect("/")
    })

    app.get("/user/profile",logger.logRoute("viewUserProfile"), Authorization.authRole('admin', 'user'), async (req: Request, res: Response) => {
        res.render("user_edit.ejs", {
            title: "User profile",
            user: await Authorization.getUserFromCookie("auth", req),
            status: ""
        })
    })

    // ! =================== POST ROUTES =================== //

    app.post("/user/update", logger.logRoute("updateUser"), Authorization.authRole('admin', 'user'), async (req: Request, res: Response) => {
        var userId = req.body.userId;
        delete req.body.userId;
        var status = await userController.updateUserAuth(userId, req.body, req.body.currentPassword);
        console.log(status);
        
        res.render("user_edit.ejs", {
            title: "User profile",
            user: await Authorization.getUserFromCookie("auth", req),
            status: status
        })
    })
    
    app.post("/user/delete", logger.logRoute("deleteUser"), Authorization.authRole('admin', 'user'), async (req: Request, res: Response) => {
        var status = await userController.deleteUserAuth(req.body.userId, req.body.currentPassword);
        
        if (status != "userDeleted"){
            res.render("user_edit.ejs", {
                title: "User profile",
                user: await Authorization.getUserFromCookie("auth", req),
                status: status
            })
            return;
        }

        Authorization.clearCookie("auth", res);

        res.redirect("/");
    })

    /*
   *==========================================================================
   *==========================================================================
   *============================= MOBILE ROUTES ==============================
   *==========================================================================
   *==========================================================================
   */

    // ! =================== POST ROUTES =================== //

    app.post("/user/login/mobile", logger.logRoute("mobileLogin"), async (req: Request, res: Response) => {


        console.log("\n========================================");
        console.log("[LOGIN] Incoming request: ");
        console.log(req.body);
        console.log("Accepted tags: username, password");
        console.log("Returning status: loginComplete, loginFailed");


        var result = await userController.login(req.body.username, req.body.password, req, res)
        console.log(result);
        
        res.send({status: result.status})

        // Login user
        // return status OK if login success and token
        // return status UNAUTHORIZED if login failed
        // return status BAD_REQUEST if request is invalid
        // return status INTERNAL_SERVER_ERROR if something went wrong
    })

    app.post("/user/register/mobile", logger.logRoute("mobileRegister"), async (req: Request, res: Response) => {

        console.log("\n========================================");
        console.log("[REGISTER] Incoming request: ");
        console.log(req.body);
        console.log("Accepted tags: username, password, email");
        console.log("Returning status: registrationComplete, usernameTaken, registrationFailed");
        

        var result = await userController.register(new User(req.body.username, req.body.password, req.body.email, "user", "apimobile"))
        res.send({status: result.status});

        // Register user
        // return status OK if register success
        // return status BAD_REQUEST if request is invalid
        // return status INTERNAL_SERVER_ERROR if something went wrong
    })

    app.post("/user/update/mobile", logger.logRoute("mobileUpdateUser"), async (req: Request, res: Response) => {
        
        console.log("\n========================================");
        console.log("[UPDATE] Incoming request: ");
        console.log(req.body);
        console.log("Accepted tags: token, currentPassword, username, password, email");
        console.log("Returning status: updateComplete, updateFailed, usernameTaken, passwordIncorrect, userNotFound");

        // TODO: Add token check
        var user = await Authorization.getUserIDFromToken(req.body.token);
        var currentPassword = req.body.currentPassword;

        delete req.body.token;
        delete req.body.currentPassword;

        if(!user.userId){ res.send({status: "Invalid token"}); return; }

        var status = await userController.updateUserAuth(user.userId, req.body, currentPassword);
        
        res.send({status: status})

        // Update user
        // return status OK if update success
        // return status BAD_REQUEST if request is invalid
        // return status INTERNAL_SERVER_ERROR if something went wrong
    })

    // TODO: Add mobile route for delete user (DELETE)
    app.post("/user/delete/mobile", logger.logRoute("mobileDeleteUser"), async (req: Request, res: Response) => {

        console.log("\n========================================");
        console.log("[DELETE] Incoming request: ");
        console.log(req.body);
        console.log("Accepted tags: token, currentPassword");
        console.log("Returning status: userDeleted, userNotFound, userDeleteFailed");

        var user = await Authorization.getUserIDFromToken(req.body.token);
        if(!user.userId){ res.send({status: "Invalid token"}); return; }

        var status = await userController.deleteUserAuth(user.userId, req.body.currentPassword);
        
        res.send({status: status})

        // Delete user
        // return status OK if delete success
        // return status BAD_REQUEST if request is invalid
        // return status INTERNAL_SERVER_ERROR if something went wrong
    })
}