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
* Fields for Deleting a card.
*/
interface CardDelete { 
    id: string;
}

type DeleteCardParams = CardDelete;

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = (T & WithId<Document>);

interface DeleteCardErrorResponse {
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

@Route("/api/v1/delete")
export class DeleteCardController extends Controller {

    @Post()
    public async deleteCard(@Body() body: DeleteCardParams, @Request() req: exp.Request) {

        // Attempt to delete a card
        let deleteResult = await col("card").findOneAndDelete({"_id": new ObjectId(body.id)})

        // Respond with internal server error if could not insert
        if (deleteResult === null) {
            this.setStatus(500);
            let resp: DeleteCardErrorResponse = {
                message: "database delete of card was not acknowledged"
            };
            return resp;
        }

        // Create JWT payload
        let authPayload = {
            sub: deleteResult._id.toString(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7 * 2)
        };

        // Sign payload
        let signedJwt = jwt.sign(authPayload, jwtSecret);

        // Set cookie header to contain JWT authentication payload
        this.setHeader("Set-Cookie", `auth=${signedJwt}`);

        return;
    }

}