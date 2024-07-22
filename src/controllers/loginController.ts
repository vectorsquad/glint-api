import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import * as exp from "express";
import * as bc from "bcrypt";
import { col, getJwt, setJwt } from "../utils";
import * as models from "glint-core/src/models";

@Route('/api/v1/login')
export class loginController extends Controller {
    @Post()
    public async login(@Request() req: exp.Request, @Body() body: models.ISignInRequest) {

        if (!body.login) {
            let user_jwt = getJwt(req);

            if (!user_jwt) {
                this.setStatus(400);
                let res: models.ErrorResponse = {
                    message: "Unable to fallback with JWT authentication."
                };
                return res;
            }

            return;
        }

        let user = (await col("user").findOne({ username: body.login.username })) as models.IUserDoc | null

        if (!user) {
            this.setStatus(404);
            let res: models.ErrorResponse = {
                message: "Server could not find user."
            };

            return res;
        }

        if (!user.email_verified) {
            this.setStatus(400);
            let res: models.ErrorResponse = {
                message: "Email not verified."
            };
            return res;
        }

        console.log("checking password...");
        console.log(body.login.password_hash);
        console.log(user.password_hash);
        let validPassword = bc.compareSync(body.login.password_hash, user.password_hash);
        console.log("cached result of password similarity");

        if (!validPassword) {
            this.setStatus(400);
            let res: models.ErrorResponse = {
                message: "Invalid Email or Password."
            };

            return res;
        }

        setJwt(req, user._id.toString());

        return;
    }

}