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
import nodemailer, { Transporter } from "nodemailer";
import sendMail from "../utils/email.ts";

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

const jwtSecret = randId(20);



function sendEmailWithHtml(uniqueString:string, email:string, firstName:string) {
    let link = "http://localhost:8080/api/v1/verify/?code=";

    let bodyHtml =  `<p>Thank you for signing up with VectorSquad. Please click the button below to verify your email address.</p>
            <div class="button-container">
                <a href="${link}${uniqueString}" class="button">Verify Email</a>
            </div>
            <p>If you didn't create an account with us, please ignore this email.</p>`;
    
    sendMail(email, firstName, bodyHtml);
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
                    message: "Error: user exists, email not verified"
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
                message: "Error: User already exists"
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
                message: "Error: database insertion of user was not acknowledged"
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
                message: "Error: unable to retrieve inserted registered user"
            };
            return resp;
        }

        sendEmailWithHtml(rnd, body.email, body.name_first);

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
