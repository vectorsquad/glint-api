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

interface runAppParameters {
    id: string,
    deckId: string
}

interface ICardDb extends models.ICardDoc {
    id_card: ObjectId,
    id_deck: ObjectId,
    card_shown: boolean
}

interface runAppResponse {
    id: ObjectId | null,
    side_front: string,
    side_back: string,
    quantity_cards_left: number,
    quantity_cards_total: number,
    message: string
}

@Route("/api/v1/runApp")
export class runAppController extends Controller {

    @Post()
    public async runApp(@Body() body: runAppParameters, @Request() req: exp.Request) {

        const user_id = new ObjectId(req.res?.locals.jwt.sub);
        var deck_id = new ObjectId(body.deckId);

        let deck = (await col("deck").findOne({ "id_user": user_id, "_id": deck_id })) as models.IDeckDoc | null

        if (deck === null) {
            this.setStatus(404);
            let res: runAppResponse = {
                id: null,
                side_back: "",
                side_front: "",
                quantity_cards_left: -1,
                quantity_cards_total: -1,
                message: "Server could not find deck."
            };
            return res;
        }

        let cards_in_deck = await col("card").find({ "id_deck": deck._id }).toArray() as ICardDb[];
        let cards_not_shown = await col("card").find({ "id_deck": deck._id, "card_shown": false }).toArray() as ICardDb[];

        if (cards_in_deck.length === 0) {
            this.setStatus(404);
            let res: runAppResponse = {
                id: null,
                side_back: "",
                side_front: "",
                quantity_cards_left: -1,
                quantity_cards_total: 0,
                message: "Deck is empty, please add at least one card before starting."
            };
            return res;
        }

        if (cards_not_shown.length === 0) {
            this.setStatus(200);
            let res: runAppResponse = {
                id: null,
                side_back: "",
                side_front: "",
                quantity_cards_left: 0,
                quantity_cards_total: cards_in_deck.length,
                message: "All cards in the deck were shown, no more cards remaining."
            };
            return res;
        }

        let random_card_number = Math.floor(Math.random() * (cards_not_shown.length - 1));

        let chosen_card = cards_not_shown[random_card_number] as ICardDb;

        await col("card").updateOne({ "_id": chosen_card._id }, { $set: { "card_shown": true } });

        this.setStatus(200);
        let res: runAppResponse = {
            id: chosen_card._id,
            side_back: chosen_card.side_back,
            side_front: chosen_card.side_front,
            quantity_cards_left: cards_not_shown.length - 1,
            quantity_cards_total: cards_in_deck.length,
            message: "Card retrieved succesfully."
        };

        return res;
    }

}