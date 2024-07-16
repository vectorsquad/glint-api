import { ICard} from "glint-core/src/models.js";
import { GlobalState as GS } from "@state";
import {
    Body,
    Controller,
    Request,
    Get,
    Header,
    Path,
    Post,
    Query,
    Route,
    SuccessResponse,
} from "tsoa";
import { ObjectId, WithId, Document } from "mongodb";
import * as exp from "express";

interface restartAppParameters { 
    id: string,
    deckId: string
}

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = (T & WithId<Document>);

interface IDeck {
    _id: ObjectId,
    id_user: ObjectId,
    name: string
}

interface ICardDb extends ICard {
    id_card: ObjectId,
    id_deck: ObjectId,
    card_shown: boolean
}

interface restartAppResponse {
    message: string
}

@Route("/api/v1/restartApp")
export class restartAppController extends Controller {

    @Post()
    public async runApp(@Body body:restartAppParameters, @Request() req: exp.Request) {

        var user_id = new ObjectId(body.id);
        var deck_id = new ObjectId(body.deckId);

        let deck = (await col("deck").findOne({"id_user": user_id, "_id": deck_id})) as Doc<IDeck> | null

        if(deck === null) {
            this.setStatus(404);
                let res: restartAppResponse = {
                    message: "Error: deck not found"
                };
            return res;
        }

        let cards_shown = await col("card").find({"id_deck": deck._id, "card_shown": true}).toArray() as Doc<ICardDb>[];

        if(cards_shown.length === 0) {
            this.setStatus(404);
            let res: restartAppResponse = {
                message: "Error: Deck is already restarted"
            };
            return res;
        }

        await col("card").updateMany({ "id_deck": deck_id  }, { $set: { "card_shown": false } });

        this.setStatus(200);
        let res: restartAppResponse = {
            message: "Success: Deck was restarted"
        };

        return res;
    }

}