import {
    Controller,
    Get,
    Query,
    Request,
    Route,
    Res
} from "tsoa";
import { col, setJwt } from "../utils";
import * as exp from "express";
import * as models from "glint-core/src/models";

@Route("/api/v1/sendEmailVerification")
export class sendEmailVerificationController extends Controller {

    @Get()
    public async verifyEmail(@Query() code: string, @Request() req: exp.Request) {

        const user = (await col("user").findOne({ email_verification_code: code })) as models.IUserDoc | null

        if (user === null) {
            req.res?.redirect('/verify-email?status=failure');
            return;
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

        req.res?.redirect('/verify-email?status=success');
        return;
    }
}