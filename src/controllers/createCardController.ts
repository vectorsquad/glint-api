import { ICard, IDeck } from "glint-core/src/models.js";
import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import { WithId, Document, ObjectId } from "mongodb";
import * as exp from "express";
import { col } from "../utils";

/** 
* Fields for creating a new card.
*/
interface CreateCardParams extends ICard {
    id_deck: string
}

type Doc<T> = (T & WithId<Document>);

interface CardErrorResponse {
    message: string
}

@Route("/api/v1/create")
export class CreateCardController extends Controller {

    @Post()
    public async createCard(@Body() body: CreateCardParams, @Request() req: exp.Request) {

        let id_deck = new ObjectId(body.id_deck);

        let deck = await col("deck").findOne({ "_id": id_deck }) as Doc<IDeck> | null;

        if (deck === null) {
            this.setStatus(404);
            return {
                message: "Server could not find deck."
            };
        }

        let card = {
            id_deck: deck._id,
            side_front: body.side_front,
            side_back: body.side_back,
            card_shown: false
        }

        // Attempt to create a card
        let createResult = await col("card").insertOne(card);

        // Respond with internal server error if could not insert
        if (!createResult.acknowledged) {
            this.setStatus(500);
            let resp: CardErrorResponse = {
                message: "Server could not save card."
            };
            return resp;
        }

        // Retrieve just now inserted card
        let cardDoc = await col("card").findOne({ _id: createResult.insertedId }) as Doc<ICard> | null;

        // Error early if unable to retrieve card
        if (cardDoc === null) {
            this.setStatus(500);
            let resp: CardErrorResponse = {
                message: "Server could not find card."
            };
            return resp;
        }

        // Create JWT payload
        let authPayload = {
            sub: cardDoc._id.toString(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7 * 2)
        };

        let res: CardErrorResponse = {
            message: createResult.insertedId.toString()
        };

        return res;
    }

}