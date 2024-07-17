import {
    Body,
    Controller,
    Post,
    Request,
    Route,
} from "tsoa";
import { ObjectId, WithId, Document } from "mongodb";
import * as exp from "express";
import { col } from "../utils";

interface IDeck {
    _id: ObjectId,
    id_user: ObjectId,
    name: string
}

type Doc<T> = (T & WithId<Document>);

interface DeckResponse {
    id: string | null,
    userId: string | null,
    name: string,
    message: string
}

interface CreateDeckParams {
    user_id: string,
    deck_name: string
}

@Route("/api/v1/createDeck")
export class CreateDeckController extends Controller {

    @Post()
    public async createDeck(@Body() body: CreateDeckParams, @Request() req: exp.Request) {

        var user_id = new ObjectId(body.user_id);

        let deck = (await col("deck").findOne({ "name": body.deck_name, "id_user": user_id })) as Doc<IDeck> | null

        if (deck !== null) {
            this.setStatus(400);
            let res: DeckResponse = {
                id: deck._id.toString(),
                userId: deck.id_user.toString(),
                name: deck.name,
                message: "Client provided a name for a deck that already exists."
            };
            return res;
        }

        let deckDb = {
            id_user: user_id,
            name: body.deck_name
        };

        let insertDeckDB = await col("deck").insertOne(deckDb);

        if (!insertDeckDB.acknowledged) {
            this.setStatus(502);
            let res: DeckResponse = {
                id: null,
                userId: null,
                name: "",
                message: "Server could not save deck."
            };
            return res;
        }

        this.setStatus(200);
        let resp: DeckResponse = {
            id: insertDeckDB.insertedId.toString(),
            userId: user_id.toString(),
            name: deckDb.name,
            message: "Success: The deck was created"
        };

        return resp;
    }

}