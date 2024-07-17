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

interface DeleteDeckResponse {
    id: ObjectId | null,
    userId: ObjectId | null,
    name: string,
    message: string
}

interface DeleteDeckParams {
    id: string,
}

@Route("/api/v1/deleteDeck")
export class DeleteDeckController extends Controller {

    @Post()
    public async deleteCard(@Body() body: DeleteDeckParams, @Request() req: exp.Request) {

        var deck_id = new ObjectId(body.id);

        let deck = (await col("deck").findOneAndDelete({ "_id": deck_id })) as Doc<IDeck> | null

        if (deck === null) {
            this.setStatus(502);
            let res: DeleteDeckResponse = {
                id: null,
                userId: null,
                name: "",
                message: "Server could not find and delete deck."
            };
            return res;
        }

        return;
    }

}