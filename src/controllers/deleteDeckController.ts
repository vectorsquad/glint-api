import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import { ObjectId, WithId, Document } from "mongodb";
import * as exp from "express";
import { col } from "../utils";
import * as models from "glint-core/src/models";

@Route("/api/v1/deleteDeck")
export class DeleteDeckController extends Controller {

    @Post()
    public async deleteCard(@Body() body: models.IDeleteDeckRequest, @Request() req: exp.Request) {

        var deck_id = new ObjectId(body._id);

        let deck = (await col("deck").findOneAndDelete({ "_id": deck_id })) as models.IDeckDoc | null

        if (deck === null) {
            this.setStatus(502);
            let res: models.ErrorResponse = {
                message: "Server could not find and delete deck."
            };
            return res;
        }

        return;
    }

}