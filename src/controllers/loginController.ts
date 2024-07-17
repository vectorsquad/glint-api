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
import { ObjectId, WithId, Document } from "mongodb";
import * as bc from "bcrypt";
import { randId } from "../utils";
import { col } from "../utils";

interface LoginParams {
    username: string;
    password_hash: string;
}

type Doc<T> = (T & WithId<Document>);

interface IUserDb extends IUser {
    email_verified: boolean;
}

interface LoginErrorResponse {
    id: ObjectId | null;
    username: string;
    email: string;
    name_first: string;
    name_last: string;
    message: string;
}

const jwtSecret = randId(20);

@Route('/api/v1/login')
export class loginController extends Controller {
    @Post()
    public async login(@Body() body: LoginParams, @Request() req: exp.Request) {

        let user = (await col("user").findOne({ "username": body.username })) as Doc<IUserDb> | null

        if (user === null) {
            this.setStatus(404);
            let res: LoginErrorResponse = {
                id: null,
                username: "",
                email: "",
                name_first: "",
                name_last: "",
                message: "Server could not find user."
            };

            return res;
        }

        if (!user.email_verified) {
            this.setStatus(400);
            let res: LoginErrorResponse = {
                id: user._id,
                username: user.username,
                email: user.email,
                name_first: user.name_first,
                name_last: user.name_last,
                message: "Email not verified."
            };
            return res;
        }


        let validPassword = await bc.compare(body.password_hash, user.password);

        if (!validPassword) {
            this.setStatus(400);
            let res: LoginErrorResponse = {
                id: null,
                username: "",
                email: "",
                name_first: "",
                name_last: "",
                message: "Invalid Email or Password."
            };

            return res;
        }


        this.setStatus(200);
        let res: LoginErrorResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            name_first: user.name_first,
            name_last: user.name_last,
            message: "Success: user logged in"
        };

        // Create JWT payload
        let authPayload = {
            sub: user._id.toString(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7 * 2)
        };

        // Sign payload
        let signedJwt = jwt.sign(authPayload, jwtSecret);

        // Set cookie header to contain JWT authentication payload
        this.setHeader("Set-Cookie", `auth=${signedJwt}`);

        return res;
    }

}