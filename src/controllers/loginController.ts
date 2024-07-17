import { IUser } from "glint-core/src/models.js";
import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import jwt from "jsonwebtoken";
import * as exp from "express";
import { WithId, Document } from "mongodb";
import * as bc from "bcrypt";
import { col } from "../utils";
import { GlobalState } from "@state";

interface LoginParams {
    username: string;
    password_hash: string;
}

type Doc<T> = (T & WithId<Document>);

interface IUserDb extends IUser {
    email_verified: boolean;
}

interface LoginErrorResponse {
    message: string;
}

@Route('/api/v1/login')
export class loginController extends Controller {
    @Post()
    public async login(@Body() body: LoginParams, @Request() req: exp.Request) {

        let user = (await col("user").findOne({ "username": body.username })) as Doc<IUserDb> | null

        if (user === null) {
            this.setStatus(404);
            let res: LoginErrorResponse = {
                message: "Server could not find user."
            };

            return res;
        }

        if (!user.email_verified) {
            this.setStatus(400);
            let res: LoginErrorResponse = {
                message: "Email not verified."
            };
            return res;
        }


        let validPassword = await bc.compare(body.password_hash, user.password);

        if (!validPassword) {
            this.setStatus(400);
            let res: LoginErrorResponse = {
                message: "Invalid Email or Password."
            };

            return res;
        }


        this.setStatus(200);
        let res: LoginErrorResponse = {
            message: "Success: user logged in"
        };

        // Create JWT payload
        let authPayload = {
            sub: user._id.toString(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7 * 2)
        };

        // Sign payload
        let signedJwt = jwt.sign(authPayload, GlobalState.jwt.secret);

        // Set cookie header to contain JWT authentication payload
        this.setHeader("Set-Cookie", `auth=${signedJwt}`);

        return res;
    }

}