import {
    Controller,
    Get,
    Query,
    Request,
    Route,
} from "tsoa";
import { col, setJwt } from "../utils";
import * as exp from "express";
import * as models from "glint-core/src/models";

@Route("/api/v1/verify")
export class verificationController extends Controller {

    @Get()
    public async verifyEmail(@Query() code: string, @Request() req: exp.Request) {

        const user = (await col("user").findOne({ email_verification_code: code })) as models.IUserDoc | null

        if (user === null) {
            this.setStatus(500);
            let res: models.ErrorResponse = {
                message: "Server could not find user."
            };
            return res;
        }

        user.email_verified = true;

        setJwt(req, user._id.toString());

        await col("user").updateOne(
            { _id: user._id },
            {
                $set: {
                    email_verified: true
                },
                $unset: {
                    email_verification_code: null
                }
            }
        );

        this.setStatus(200);
        return;
    }
}

And the send email code is

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

