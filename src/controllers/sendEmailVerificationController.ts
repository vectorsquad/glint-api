import { IUser } from "glint-core/src/models.js";
import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";

import * as exp from "express";
import { WithId, Document, ObjectId } from "mongodb";
import { sendEmailVerificationCode, sendMail } from "../utils";
import { col } from "../utils";

interface sendEmailVerificationParams {
    emailOrUsername: string
}

type Doc<T> = (T & WithId<Document>);

interface IUserDb extends IUser {
    email_verified: boolean;
}

interface sendEmailResponse {
    id: ObjectId | null;
    username: string;
    email: string;
    name_first: string;
    name_last: string;
    message: string;
}

@Route('/api/v1/sendEmailVerification')
export class sendEmailVerificationController extends Controller {
    @Post()
    public async sendEmailVerification(@Body() body: sendEmailVerificationParams, @Request() req: exp.Request) {
        let user = (await col("user").findOne({ "email": body.emailOrUsername })) as Doc<IUserDb> | null

        if (user === null) {
            user = (await col("user").findOne({ "username": body.emailOrUsername })) as Doc<IUserDb> | null
        }

        if (user !== null && user.email_verified == false) {
            sendEmailVerificationCode(user.verification_code, user.email, user.name_first);

            this.setStatus(200);
            let res: sendEmailResponse = {
                id: user._id,
                username: user.username,
                email: user.email,
                name_first: user.name_first,
                name_last: user.name_last,
                message: "Success: Email verification sent"
            }
            return res;
        }

        this.setStatus(404);
        let res: sendEmailResponse = {
            id: null,
            username: "",
            email: "",
            name_first: "",
            name_last: "",
            message: "Error: The user was not found"
        }
        return res;
    }
}