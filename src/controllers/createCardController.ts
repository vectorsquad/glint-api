import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import { ObjectId } from "mongodb";
import * as exp from "express";
import { col } from "../utils";
import * as models from "glint-core/src/models";

@Route("/api/v1/create")
export class CreateCardController extends Controller {

    @Post()
    public async createCard(@Body() body: models.ICreateCardRequest, @Request() req: exp.Request) {

        let id_deck = new ObjectId(body.id_deck);

        let deck = await col("deck").findOne({ "_id": id_deck }) as models.ICardDoc | null;

        if (deck === null) {
            this.setStatus(404);
            return {
                message: "Server could not find deck."
            };
        }

        let filterFind: Pick<models.ICardDoc, "id_deck"> = {
            id_deck: deck._id
        };

        let filterSort: { [key: string]: -1 } = {
            deck_index: -1
        };

        let highestIndexCard = await col("card").find(filterFind).sort(filterSort).limit(1).next() as models.ICardDoc | null;

        let highestIndex = highestIndexCard ? highestIndexCard.deck_index + 1 : 0;

        (body as (typeof body) & Pick<models.ICardDoc, "deck_index">).deck_index = highestIndex;

        // Attempt to create a card
        let createResult = await col("card").insertOne(body);

        // Respond with internal server error if could not insert
        if (!createResult.acknowledged) {
            this.setStatus(500);
            let resp: models.ErrorResponse = {
                message: "Server could not save card."
            };
            return resp;
        }

        // Retrieve just now inserted card
        let cardDoc = await col("card").findOne({ _id: createResult.insertedId }) as models.ICardDoc | null;

        // Error early if unable to retrieve card
        if (cardDoc === null) {
            this.setStatus(500);
            let resp: models.ErrorResponse = {
                message: "Server could not find card."
            };
            return resp;
        }

        let res: models.ICreateCardResponse = {
            _id: createResult.insertedId.toString(),
            deck_index: highestIndex
        }

        return res;
    }

}