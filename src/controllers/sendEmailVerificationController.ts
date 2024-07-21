import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";

import * as exp from "express";
import { sendEmailVerificationCode } from "../utils";
import { col } from "../utils";
import * as models from "glint-core/src/models";

@Route('/api/v1/sendEmailVerification')
export class sendEmailVerificationController extends Controller {
    @Post()
    public async sendEmailVerification(@Body() body: models.ISendEmailVerificationRequest, @Request() req: exp.Request) {
        let user = (await col("user").findOne({ "email": body.email })) as models.IUserDoc | null

        if (user === null) {
            user = (await col("user").findOne({ "username": body.username })) as models.IUserDoc | null
        }

        if (user !== null && user.email_verified == false) {
            sendEmailVerificationCode(user.email_verification_code, user.email, user.name_first, req);
            return;
        }

        this.setStatus(404);
        let res: models.ErrorResponse = {
            message: "Error: The user was not found"
        }
        return res;
    }
}