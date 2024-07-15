import { GlobalState as GS } from "@state";
import {
    Body,
    Controller,
    Post,
    Route,
} from "tsoa";
import { ObjectId, WithId, Document } from "mongodb";

interface IDeck {
    id_user: ObjectId,
    name: string
}

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = (T & WithId<Document>);

interface DeckResponse {
    id: ObjectId | null,
    userId: ObjectId | null,
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
    public async createDeck(@Body() body: CreateDeckParams) {

        var user_id = new ObjectId(body.user_id);

        let deck = (await col("deck").findOne({ "name": body.deck_name, "id_user": user_id })) as Doc<IDeck> | null

        if (deck !== null) {
            this.setStatus(400);
            let res: DeckResponse = {
                id: deck._id,
                userId: deck.id_user,
                name: deck.name,
                message: "Error: A deck with this name already exists"
            };
            return res;
        }

        let new_deck: IDeck = {
            id_user: user_id,
            name: body.deck_name
        }

        let deck_insert_result = await col("deck").insertOne(new_deck);

        if (!deck_insert_result.acknowledged) {
            this.setStatus(502);
            let res: DeckResponse = {
                id: null,
                userId: null,
                name: "",
                message: "Error: Could not add the deck to the database"
            };
            return res;
        }

        this.setStatus(200);
        let resp: DeckResponse = {
            id: deck_insert_result.insertedId,
            userId: user_id,
            name: new_deck.name,
            message: "Success: The deck was created"
        };

        return resp;
    }

}