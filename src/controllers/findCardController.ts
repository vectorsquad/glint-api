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

import randId from "../utils/randId";

/** 
* Fields for Updating a card.
*/
type FindCardParams = ICard;

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = (T & WithId<Document>);

interface FindCardErrorResponse {
    message: string
}

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

        return cardDoc._id;
    }

}