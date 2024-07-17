import { IUser } from "glint-core/src/models.js";
import { GlobalState as GS } from "@state";
import {
    Body,
    Controller,
    Request,
    Post,
    Query,
    Route,
} from "tsoa";

import * as exp from "express";
import { ObjectId, WithId, Document } from "mongodb";
import * as bc from "bcrypt";
import { randId, sendEmailPasswordRecovery } from "../utils"

const bcryptSaltRounds = 10;

interface updatePasswordParams {
    password: string;
    password_repeat: string;
}

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = (T & WithId<Document>);

interface IUserDb extends IUser {
    email_verified: boolean;
}

interface updatePasswordResponse {
    id: ObjectId | null;
    username: string;
    email: string;
    name_first: string;
    name_last: string;
    message: string;
}

@Route('/api/v1/updatePassword')
export class updatePasswordController extends Controller {
    @Post()
    public async upadatePassword(@Body() body: updatePasswordParams, @Request() req: exp.Request, @Query() user_code: string) {

        let user = (await col("user").findOne({ "verification_code": user_code })) as Doc<IUserDb> | null

        if (user === null) {
            this.setStatus(404);
            let res: updatePasswordResponse = {
                id: null,
                username: "",
                email: "",
                name_first: "",
                name_last: "",
                message: "Server could not find user."
            }
            return res;
        }

        if (body.password !== body.password_repeat) {
            this.setStatus(400);
            let res: updatePasswordResponse = {
                id: null,
                username: "",
                email: "",
                name_first: "",
                name_last: "",
                message: "Passwords do not match."
            }
            return res;
        }

        body.password = await bc.hash(body.password, bcryptSaltRounds);

        if (user.email_verified === true) {
            await col("user").updateOne({ _id: user._id }, { $set: { password: body.password, verification_code: null } });
        }
        else {
            let rnd = randId(6);
            sendEmailPasswordRecovery(rnd, user.email, user.name_first);
            await col("user").updateOne({ _id: user._id }, { $set: { password: body.password, verification_code: rnd } });
        }


        this.setStatus(200);
        let res: updatePasswordResponse = {
            id: user._id,
            username: user.username,
            email: user.email,
            name_first: user.name_first,
            name_last: user.name_last,
            message: "Password updated successfully."
        }
        return res;
    }
}