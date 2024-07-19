import { IUser } from "glint-core/src/models.js";
import {
    Controller,
    Get,
    Query,
    Route,
} from "tsoa";
import { WithId, Document } from "mongodb";
import { col, setJwt } from "../utils";

type Doc<T> = (T & WithId<Document>);

interface IUserDb extends IUser {
    email_verified: boolean;
}

interface VerificationErrorResponse {
    message: string
}

@Route("/api/v1/verify")
export class verificationController extends Controller {

    @Get()
    public async verifyEmail(@Query() code: string) {

        const user = (await col("user").findOne({ "verification_code": code })) as Doc<IUserDb> | null

        if (user !== null) {
            user.email_verified = true;

            // setJwt(this, user._id.toString());

            await col("user").updateOne({ _id: user._id }, { $set: { email_verified: true, verification_code: null } });
            this.setStatus(200);
            let res: VerificationErrorResponse = {
                message: "Verified Email."
            };

            return res;
        }

        this.setStatus(500);
        let res: VerificationErrorResponse = {
            message: "Server could not find user."
        };

        return res;
    }
}