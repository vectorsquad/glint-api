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
import * as models from "glint-core/src/models";

@Route("/api/v1/findDeck")
export class FindDeckController extends Controller {

    @Post()
    public async findDeck(@Body() body: models.IFindDeckRequest, @Request() req: exp.Request) {

        const user_id = new ObjectId(req.res?.locals.jwt.sub);

        const deckQuery: { [key: string]: any } = {
            id_user: user_id
        };

        if (body._id) {
            deckQuery._id = body._id

        }

        if (body.name) {
            deckQuery.name = {
                $regex: `^${body.name}`,
                $options: "i"
            };
        }

        const decks = await col("deck").find(deckQuery).toArray() as models.IDeckDoc[];

        return decks;
    }

    // Optional: JWT handling can remain as per your original implementation
}
