import {
    Body,
    Controller,
    Request,
    Post,
    Query,
    Route,
} from "tsoa";

import * as exp from "express";
import * as bc from "bcrypt";
import { col, randId, sendEmailPasswordRecovery } from "../utils"
import * as models from "glint-core/src/models";

const bcryptSaltRounds = 10;

@Route('/api/v1/updatePassword')
export class updatePasswordController extends Controller {
    @Post()
    public async upadatePassword(@Body() body: models.IUpdatePasswordRequest, @Request() req: exp.Request, @Query() user_code: string) {

        let user = (await col("user").findOne({ "verification_code": user_code })) as models.IUserDoc | null

        if (user === null) {
            this.setStatus(404);
            let res: models.ErrorResponse = {
                message: "Server could not find user."
            }
            return res;
        }

        body.password = await bc.hash(body.password, bcryptSaltRounds);

        if (user.email_verified) {
            await col("user").updateOne({ _id: user._id }, { $set: { password: body.password, verification_code: null } });
        }
        else {
            let rnd = randId(6);
            sendEmailPasswordRecovery(rnd, user.email, user.name_first, req);
            await col("user").updateOne({ _id: user._id }, { $set: { password: body.password, verification_code: rnd } });
        }

        return;
    }
}