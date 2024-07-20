import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import * as bc from "bcrypt";
import * as exp from "express";
import { sendEmailVerificationCode } from "../utils/email";
import { randId } from "../utils";
import { col } from "../utils";
import * as models from "glint-core/src/models";

const bcryptSaltRounds = 10;

@Route("/api/v1/register")
export class RegisterUserController extends Controller {

    @Post()
    public async registerUser(@Body() body: models.ISignUpRequest, @Request() req: exp.Request) {

        // Attempt to find user with existing email
        let userWithEmail = (await col("user").findOne({ "email": body.email })) as models.IUserDoc | null

        // Guard clause for if user already exists
        if (userWithEmail !== null) {

            // Not verified: user should check their inbox
            if (!userWithEmail.email_verified) {
                this.setStatus(400);
                let res: models.ErrorResponse = {
                    message: "User exists, Email not verified."
                };

                return res;
            }

            // Verified: can't register with already used email
            this.setStatus(400);
            let res: models.ErrorResponse = {
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
            let resp: models.ErrorResponse = {
                message: "Server could not save user."
            };
            return resp;
        }

        // Retrieve just now inserted user
        let userDoc = await col("user").findOne({ email: body.email }) as models.IUserDoc | null;

        // Error early if unable to retrieve user
        if (userDoc === null) {
            this.setStatus(500);
            let resp: models.ErrorResponse = {
                message: "Server could not retrieve previously saved user."
            };
            return resp;
        }

        sendEmailVerificationCode(rnd, body.email, body.name_first);

        return;
    }

}
