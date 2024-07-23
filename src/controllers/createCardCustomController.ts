import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import { Filter, ObjectId } from "mongodb";
import * as exp from "express";
import { col } from "../utils";
import * as models from "glint-core/src/models";
import { ICardNative } from "glint-core/src/models/modelsNative";

@Route("/api/v1/createCard")
export class CreateCardController extends Controller {

    @Post()
    public async createCard(@Body() body: Pick<ICardNative, "id_deck">, @Request() req: exp.Request) {

        let id_deck = new ObjectId(body.id_deck);

        let existingDeck = await col("deck").findOne({ "_id": id_deck }) as models.ICardDoc | null;

        if (!existingDeck) {
            this.setStatus(404);
            return {
                message: "Server could not find deck."
            };
        }

        let filterFind: Pick<models.ICardDoc, "id_deck"> = {
            id_deck: existingDeck._id
        };

        let filterSort: Filter<models.ICardDoc> = {
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

        return;
    }

}