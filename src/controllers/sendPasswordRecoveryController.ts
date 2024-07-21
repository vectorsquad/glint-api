import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";

import * as exp from "express";
import { randId, sendEmailPasswordUpdateCode, sendMail } from "../utils";
import { col } from "../utils";
import * as models from "glint-core/src/models";

@Route('/api/v1/sendPasswordRecovery')
export class sendPasswordRecoveryController extends Controller {
    @Post()
    public async sendPasswordRecovery(@Body() body: models.ISendPasswordRecoveryRequest, @Request() req: exp.Request) {
        let user = (await col("user").findOne({ "email": body.email })) as models.IUserDoc | null

        if (user === null) {
            user = (await col("user").findOne({ "username": body.username })) as models.IUserDoc | null
        }

        if (user !== null) {
            let rnd = randId(6);
            await col("user").updateOne({ _id: user._id }, { $set: { verification_code: rnd } });
            sendEmailPasswordUpdateCode(rnd, user.email, user.name_first, req);

            return;
        }

        this.setStatus(404);
        let res: models.ErrorResponse = {
            message: "Server could not find user."
        }
        return res;
    }
}