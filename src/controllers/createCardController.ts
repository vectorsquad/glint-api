import { ICard } from "glint-core/src/models.js";
import { GlobalState as GS } from "@state";
import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import { WithId, Document } from "mongodb";
import * as exp from "express";

/** 
* Fields for creating a new card.
*/
type CreateCardParams = ICard;

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = (T & WithId<Document>);

interface CardErrorResponse {
    message: string
}

@Route("/api/v1/create")
export class CreateCardController extends Controller {

    @Post()
    public async createCard(@Body() body: CreateCardParams, @Request() req: exp.Request) {

        // Attempt to create a card
        let createResult = await col("card").insertOne(body);

        // Respond with internal server error if could not insert
        if (!createResult.acknowledged) {
            this.setStatus(500);
            let resp: CardErrorResponse = {
                message: "database create of card was not acknowledged"
            };
            return resp;
        }

        // Retrieve just now inserted card
        let cardDoc = await col("card").findOne({ _id: createResult.insertedId }) as Doc<ICard> | null;

        // Error early if unable to retrieve card
        if (cardDoc === null) {
            this.setStatus(500);
            let resp: CardErrorResponse = {
                message: "unable to retrieve newly created card..." + createResult.insertedId
            };
            return resp;
        }

        let res: CardErrorResponse = {
            message: "Card created with ID:" + createResult.insertedId
        };

        return res;
    }

}