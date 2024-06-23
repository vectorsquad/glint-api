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
import * as bc from "bcrypt";
import { ObjectId, WithId, Document } from "mongodb";
import jwt from "jsonwebtoken";
import * as exp from "express";

const bcryptSaltRounds = 10;

/** 
* Fields for registering a new user.
*/
type RegisterUserParams = IUser;

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = (T & WithId<Document>);

interface IUserDb extends IUser {
    email_verified: boolean;
}

interface ErrorResponse {
    message: string
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

const jwtSecret = randId(20);

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
                    message: "user exists, email not verified"
                };

                return res;
            }

            // Verified: can't register with already used email
            this.setStatus(400);
            let res: ErrorResponse = {
                message: "user exists, email verified"
            };

            return res;

        }

        // Hash given password
        body.password_hash = await bc.hash(body.password_hash, bcryptSaltRounds);

        // Attempt to insert user
        let insertResult = await col("user").insertOne(body);

        // Respond with internal server error if could not insert
        if (!insertResult.acknowledged) {
            this.setStatus(500);
            let resp: ErrorResponse = {
                message: "database insertion of user was not acknowledged"
            };
            return resp;
        }

        // Retrieve just now inserted user
        let userDoc = await col("user").findOne({ email: body.email }) as Doc<IUser> | null;

        // Error early if unable to retrieve user
        if (userDoc === null) {
            this.setStatus(500);
            let resp: ErrorResponse = {
                message: "unable to retrieve inserted registered user"
            };
            return resp;
        }

        // Create JWT payload
        let authPayload = {
            sub: userDoc._id.toString(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7 * 2)
        };

        // Sign payload
        let signedJwt = jwt.sign(authPayload, jwtSecret);

        // Set cookie header to contain JWT authentication payload
        this.setHeader("Set-Cookie", `auth=${signedJwt}`);

        return;
    }

}