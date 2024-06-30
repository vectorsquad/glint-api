import { ICard} from "glint-core/src/models.js";
import { GlobalState as GS } from "@state";
import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import { WithId, Document, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import * as exp from "express";

const bcryptSaltRounds = 10;

/** 
* Fields for Updating a card.
*/

interface CardUpdates extends ICard { 
    id: string;
}

type UpdateCardParams = CardUpdates;

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = (T & WithId<Document>);

interface UpdateCardErrorResponse {
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

@Route("/api/v1/update")
export class UpdateCardController extends Controller {

    @Post()
    public async updateCard(@Body() body: UpdateCardParams, @Request() req: exp.Request) {


        // Attempt to update an existing card
        let updateResult = await col("card").findOneAndUpdate( 
            { 
                "_id": new ObjectId(body.id)
            }, 
            {
                $set:
                { 
                    "side_front": body.side_front, 
                    "side_back": body.side_back 
                }
            }
        )

        // Respond with internal server error if could not insert
        if (updateResult === null) {
            this.setStatus(500);
            let resp: UpdateCardErrorResponse = {
                message: "unable to update card"
            };
            return resp;
        }

        
        // Create JWT payload
        let authPayload = {
            sub: updateResult._id.toString(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7 * 2)
        };

        // Sign payload
        let signedJwt = jwt.sign(authPayload, jwtSecret);

        // Set cookie header to contain JWT authentication payload
        this.setHeader("Set-Cookie", `auth=${signedJwt}`);

        return;
    }

}