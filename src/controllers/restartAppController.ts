import * as models from "glint-core/src/models";
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

interface restartAppParameters {
    id: string,
    deckId: string
}

interface ICardDb extends models.ICardDoc {
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
    public async runApp(@Body() body: restartAppParameters, @Request() req: exp.Request) {

        const user_id = new ObjectId(req.res?.locals.jwt.sub);
        var deck_id = new ObjectId(body.deckId);

        let deck = (await col("deck").findOne({ "id_user": user_id, "_id": deck_id })) as models.IDeckDoc | null

        if (deck === null) {
            this.setStatus(404);
            let res: restartAppResponse = {
                message: "Server could not find deck."
            };
            return res;
        }

        let cards_shown = await col("card").find({ "id_deck": deck._id, "card_shown": true }).toArray() as ICardDb[];

        if (cards_shown.length === 0) {
            this.setStatus(404);
            let res: restartAppResponse = {
                message: "Deck has already been restarted."
            };
            return res;
        }

        await col("card").updateMany({ "id_deck": deck_id }, { $set: { "card_shown": false } });

        this.setStatus(200);
        let res: restartAppResponse = {
            message: "Restarted deck."
        };

        return res;
    }

}