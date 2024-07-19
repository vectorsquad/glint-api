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

interface IDeck {
    _id: ObjectId,
    id_user: ObjectId,
    name: string
}

interface FindDeckParams {
    deck_name?: string
    deck_id?: string
}

@Route("/api/v1/findDeck")
export class FindDeckController extends Controller {

    @Post()
    public async findDeck(@Body() body: FindDeckParams, @Request() req: exp.Request) {

        const user_id = new ObjectId(req.res?.locals.jwt.sub);

        const deckQuery: { [key: string]: any } = {
            id_user: user_id
        };

        if (body.deck_name !== undefined) {
            deckQuery.name = body.deck_name;

        } else if (body.deck_id !== undefined) {
            deckQuery.id_user = body.deck_id;
        }

        const decks = await col("deck").find(deckQuery).toArray() as IDeck[];

        return {
            decks: decks,
            quantity: decks.length
        };
    }

    // Optional: JWT handling can remain as per your original implementation
}
