import { IUser } from "glint-core/src/models.js";
import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";

import * as exp from "express";
import { ObjectId, WithId, Document } from "mongodb";
import { randId, sendEmailPasswordUpdateCode, sendMail } from "../utils";
import { col } from "../utils";

interface sendPasswordRecoveryParams {
    emailOrUsername: string
}

type Doc<T> = (T & WithId<Document>);

interface IUserDb extends IUser {
    email_verified: boolean;
}

interface sendPasswordResponse {
    id: ObjectId | null;
    username: string;
    email: string;
    name_first: string;
    name_last: string;
    message: string;
}

@Route('/api/v1/sendPasswordRecovery')
export class sendPasswordRecoveryController extends Controller {
    @Post()
    public async sendPasswordRecovery(@Body() body: sendPasswordRecoveryParams, @Request() req: exp.Request) {
        let user = (await col("user").findOne({ "email": body.emailOrUsername })) as Doc<IUserDb> | null

        if (user === null) {
            user = (await col("user").findOne({ "username": body.emailOrUsername })) as Doc<IUserDb> | null
        }

        if (user !== null) {
            let rnd = randId(6);
            await col("user").updateOne({ _id: user._id }, { $set: { verification_code: rnd } });
            sendEmailPasswordUpdateCode(rnd, user.email, user.name_first);

            this.setStatus(200);
            let res: sendPasswordResponse = {
                id: user._id,
                username: user.username,
                email: user.email,
                name_first: user.name_first,
                name_last: user.name_last,
                message: "Password recovery request sent."
            }
            return res;
        }

        this.setStatus(404);
        let res: sendPasswordResponse = {
            id: null,
            username: "",
            email: "",
            name_first: "",
            name_last: "",
            message: "Server could not find user."
        }
        return res;
    }
}