import { ICard } from "glint-core/src/models.js";
import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import { WithId, Document } from "mongodb";
import * as exp from "express";
import { col } from "../utils";

/** 
* Fields for Updating a card.
*/
type FindCardParams = ICard;

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
                message: "Server could not find card."
            };
            return resp;
        }

        return cardDoc._id;
    }

}