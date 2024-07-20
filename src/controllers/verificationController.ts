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
                    email_verification_code: ""
                }
            }
        );

        return;
    }
}