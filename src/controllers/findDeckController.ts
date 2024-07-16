import { GlobalState as GS } from "@state";
import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import { ObjectId, WithId, Document } from "mongodb";
import * as exp from "express";
import randId from "../utils/randId";

interface IDeck {
    _id: ObjectId,
    id_user: ObjectId,
    name: string
}

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = T & WithId<Document>;

interface FindDeckResponse {
    decks: IDeck[] | null,
    quantity: number,
    message: string
}

interface FindDeckParams {
    user_id: string,
    deck_name: string
}

@Route("/api/v1/findDeck")
export class FindDeckController extends Controller {

    @Post()
    public async findDeck(@Body() body: FindDeckParams, @Request() req: exp.Request): Promise<FindDeckResponse> {

        const user_id = new ObjectId(body.user_id);

        const deckQuery = { 
            name: { $regex: body.deck_name, $options: 'i' }, 
            id_user: user_id 
        };

        const decks = await col("deck").find(deckQuery).toArray() as Doc<IDeck>[];

        if (decks.length === 0) {
            this.setStatus(404);
            return {
                decks: [],
                quantity: 0,
                message: "Error: No results"
            }; 
        }

        this.setStatus(200);
        return {
            decks: decks,
            quantity: decks.length,
            message: "Success: Searched"
        }; 
    }

    // Optional: JWT handling can remain as per your original implementation
}
