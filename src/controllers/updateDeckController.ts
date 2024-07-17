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

interface IDeck {
    _id: ObjectId,
    id_user: ObjectId,
    name: string
}

type Doc<T> = (T & WithId<Document>);

interface UpdateDeckResponse {
    id: ObjectId | null,
    userId: ObjectId | null,
    name: string,
    message: string
}

interface updateDeckParams {
    user_id: string,
    deck_id: string,
    deck_name: string
}

@Route("/api/v1/updateDeck")
export class UpdateDeckController extends Controller {

    @Post()
    public async FindDeck(@Body() body: updateDeckParams, @Request() req: exp.Request) {

        var user_id = new ObjectId(body.user_id);
        var deck_id = new ObjectId(body.deck_id);

        let deck = (await col("deck").findOne({ "_id": deck_id, "id_user": user_id })) as Doc<IDeck> | null

        if (deck === null) {
            this.setStatus(404);
            let res: UpdateDeckResponse = {
                id: null,
                userId: null,
                name: "",
                message: "Error: Deck not found"
            };
            return res;
        }

        await col("deck").updateOne({ _id: deck._id }, { $set: { "name": body.deck_name } });

        this.setStatus(200);
        let res: UpdateDeckResponse = {
            id: deck._id,
            userId: deck.id_user,
            name: deck.name,
            message: "Success: Deck name updated"
        };

        return res;
    }

}