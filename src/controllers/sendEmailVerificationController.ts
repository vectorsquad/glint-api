import { IUser } from "glint-core/src/models.js";
import { GlobalState as GS } from "@state";
import {
    Body,
    Controller,
    Request,
    Get,
    Header,
    Path,
    Post,
    Query,
    Route,
    SuccessResponse,
} from "tsoa";


import * as exp from "express";
import { ObjectId, WithId, Document } from "mongodb";
import sendMail from "../utils/email.ts";

interface sendEmailVerificationParams {
    emailOrUsername:string
}

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = (T & WithId<Document>);

interface IUserDb extends IUser {
    email_verified: boolean;
}

interface sendEmailResponse {
    id: ObjectId | null;
    username: string;
    email: string;
    name_first: string;
    name_last: string;
    message: string;
}

function randId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

function sendEmailWithHtml(uniqueString: string, email: string, firstName: string) {
    let link = "https://glint.cleanmango.com/api/v1/verify/?code=";
    let emailSubject = "Email Verification"

    let bodyHtml = `<p>Thank you for signing up with VectorSquad. Please click the button below to verify your email address.</p>
            <div class="button-container">
                <a href="${link}${uniqueString}" class="button">Verify Email</a>
            </div>
            <p>If you didn't create an account with us, please ignore this email.</p>`;

    sendMail(email, firstName, bodyHtml, emailSubject);
}

@Route('/api/v1/sendEmailVerification')
export class sendEmailVerificationController extends Controller
{
    @Post()
    public async sendEmailVerification(@Body() body: sendEmailVerificationParams, @Request() req: exp.Request)
    {
        let user = (await col("user").findOne({ "email":body.emailOrUsername })) as Doc<IUserDb> | null

        if(user === null)
            {
                user = (await col("user").findOne({ "username":body.emailOrUsername })) as Doc<IUserDb> | null
            }

        if(user !== null && user.email_verified == false)
            {
                //let rnd = randId(6);
                //await col("user").updateOne({ _id: user._id }, { $set: { verification_code: rnd } });
                sendEmailWithHtml(user.verification_code, user.email, user.name_first);

                this.setStatus(200);
                let res:sendPasswordResponse = {
                    id:user._id,
                    username:user.username,
                    email: user.email,
                    name_first: user.name_first,
                    name_last: user.name_last,
                    message: "Success: Email verification sent"
                } 
                return res;
            }

            this.setStatus(404);
            let res:updatePasswordResponse = {
                id:"",
                username:"",
                email: "",
                name_first: "",
                name_last: "",
                message: "Error: The user was not found"
            } 
            return res;
    }
}