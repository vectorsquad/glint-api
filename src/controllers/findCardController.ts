import { ICard} from "glint-core/src/models.js";
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
* Fields for Updating a card.
*/
type FindCardParams = ICard;

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = (T & WithId<Document>);

interface FindCardErrorResponse {
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

@Route("/api/v1/find")
export class FindCardController extends Controller {

    @Post()
    public async findCard(@Body() body: FindCardParams, @Request() req: exp.Request) {

        // Retrieve card
        let cardDoc = await col("card").findOne({ side_front: { $regex: body.side_front }, side_back: { $regex: body.side_back } }) as Doc<ICard> | null;

        // Error early if unable to retrieve card
        if (cardDoc === null) {
            this.setStatus(500);
            let resp: FindCardErrorResponse = {
                message: "unable to retrieve card"
            };
            return resp;
        }

        // Create JWT payload
        let authPayload = {
            sub: cardDoc._id.toString(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7 * 2)
        };

        // Sign payload
        let signedJwt = jwt.sign(authPayload, jwtSecret);

        // Set cookie header to contain JWT authentication payload
        this.setHeader("Set-Cookie", `auth=${signedJwt}`);

        return cardDoc._id;
    }

}