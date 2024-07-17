import { IUser } from "glint-core/src/models.js";
import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import * as bc from "bcrypt";
import { ObjectId, WithId, Document } from "mongodb";
import * as exp from "express";
import { sendEmailVerificationCode, sendMail } from "../utils/email";
import { randId } from "../utils";
import { col } from "../utils";

const bcryptSaltRounds = 10;

/** 
* Fields for registering a new user.
*/
type RegisterUserParams = IUser;

type Doc<T> = (T & WithId<Document>);

interface IUserDb extends IUser {
    email_verified: boolean;
}

interface ErrorResponse {
    id: ObjectId | null;
    username: string;
    email: string;
    name_first: string;
    name_last: string;
    message: string;
}

@Route("/api/v1/register")
export class RegisterUserController extends Controller {

    @Post()
    public async registerUser(@Body() body: RegisterUserParams, @Request() req: exp.Request) {

        // Attempt to find user with existing email
        let userWithEmail = (await col("user").findOne({ "email": body.email })) as Doc<IUserDb> | null

        // Guard clause for if user already exists
        if (userWithEmail !== null) {

            // Not verified: user should check their inbox
            if (!userWithEmail.email_verified) {
                this.setStatus(400);
                let res: ErrorResponse = {
                    id: userWithEmail._id,
                    username: userWithEmail.username,
                    email: userWithEmail.email,
                    name_first: userWithEmail.name_first,
                    name_last: userWithEmail.name_last,
                    message: "User exists, Email not verified."
                };

                return res;
            }

            // Verified: can't register with already used email
            this.setStatus(400);
            let res: ErrorResponse = {
                id: userWithEmail._id,
                username: userWithEmail.username,
                email: userWithEmail.email,
                name_first: userWithEmail.name_first,
                name_last: userWithEmail.name_last,
                message: "User with provided email already exists."
            };

            return res;

        }

        // Hash given password
        body.password_hash = await bc.hash(body.password_hash, bcryptSaltRounds);

        let rnd = randId(6);

        let user = {
            username: body.username,
            password: body.password_hash,
            email: body.email,
            name_first: body.name_first,
            name_last: body.name_last,
            email_verified: false,
            verification_code: rnd
        };

        // Attempt to insert user
        let insertResult = await col("user").insertOne(user);

        // Respond with internal server error if could not insert
        if (!insertResult.acknowledged) {
            this.setStatus(500);
            let resp: ErrorResponse = {
                id: null,
                username: "",
                email: "",
                name_first: "",
                name_last: "",
                message: "Server could not save user."
            };
            return resp;
        }

        // Retrieve just now inserted user
        let userDoc = await col("user").findOne({ email: body.email }) as Doc<IUser> | null;

        // Error early if unable to retrieve user
        if (userDoc === null) {
            this.setStatus(500);
            let resp: ErrorResponse = {
                id: null,
                username: "",
                email: "",
                name_first: "",
                name_last: "",
                message: "Server could not retrieve previously saved user."
            };
            return resp;
        }

        sendEmailVerificationCode(rnd, body.email, body.name_first);

        this.setStatus(200);
        let res: ErrorResponse = {
            id: userDoc._id,
            username: userDoc.username,
            email: userDoc.email,
            name_first: userDoc.name_first,
            name_last: userDoc.name_last,
            message: "Success: user registered"
        };

        return res;
    }

}
