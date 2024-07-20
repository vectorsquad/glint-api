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

        let card: Omit<models.ICardDoc, "_id"> = {
            id_deck: deck._id,
            side_front: body.side_front,
            side_back: body.side_back
        }

        // Attempt to create a card
        let createResult = await col("card").insertOne(card);

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
            _id: createResult.insertedId.toString()
        }

        return res;
    }

}