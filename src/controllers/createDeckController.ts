import {
    Body,
    Controller,
    Post,
    Request,
    Route,
} from "tsoa";
import { ObjectId } from "mongodb";
import * as exp from "express";
import { col } from "../utils";
import * as models from "glint-core/src/models";

@Route("/api/v1/createDeck")
export class CreateDeckController extends Controller {

    @Post()
    public async createDeck(@Body() body: models.ICreateDeckRequest, @Request() req: exp.Request) {

        var user_id = new ObjectId(req.res?.locals.jwt.sub);

        let deck = (await col("deck").findOne({ "name": body.name, "id_user": user_id })) as models.IDeckDoc | null

        if (deck !== null) {
            this.setStatus(400);
            let res: models.ErrorResponse = {
                message: "Client provided a name for a deck that already exists."
            };
            return res;
        }

        let deckDb = {
            id_user: user_id,
            name: body.name
        };

        let insertDeckDB = await col("deck").insertOne(deckDb);

        if (!insertDeckDB.acknowledged) {
            this.setStatus(502);
            let res: models.ErrorResponse = {
                message: "Server could not save deck."
            };
            return res;
        }

        this.setStatus(200);
        let resp: models.ICreateDeckResponse = {
            _id: insertDeckDB.insertedId.toString(),
        };

        return resp;
    }

}