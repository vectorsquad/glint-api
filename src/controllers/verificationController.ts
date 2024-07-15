import { IUser } from "glint-core/src/models.js";
import { GlobalState as GS } from "@state";
import {
    Controller,
    Get,
    Query,
    Route,
} from "tsoa";
import { WithId, Document } from "mongodb";

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

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
            await col("user").updateOne({ _id: user._id }, { $set: { email_verified: true, verification_code: null } });
            this.setStatus(200);
            let res: VerificationErrorResponse = {
                message: "Success: email verified"
            };

            return res;
        }

        this.setStatus(500);
        let res: VerificationErrorResponse = {
            message: "Error: user not found"
        };

        return res;
    }
}