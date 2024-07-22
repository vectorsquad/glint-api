import {
    Body,
    Controller,
    Request,
    Post,
    Route
} from "tsoa";
import * as exp from "express";
import { col } from "../utils";
import * as models from "glint-core/src/models";
import { ObjectId } from "mongodb";

@Route("/api/v1/find")
export class FindCardController extends Controller {

    @Post()
    public async findCard(@Body() body: models.IFindCardRequest, @Request() req: exp.Request) {

        const query: { [key: string]: any } = {
            id_deck: body.id_deck
        }

        if (body._id) {
            query._id = new ObjectId(body._id);
        }

        if (body.deck_index) {
            query.deck_index = body.deck_index
        }

        if (body.side_back) {
            query.side_back = {
                $regex: `^${body.side_back}`
            }
        }

        if (body.side_front) {
            query.side_back = {
                $regex: `^${body.side_front}`
            }
        }

        // Retrieve card
        let cardDoc = await col("card").find(query).toArray() as models.ICardDoc[];

        return cardDoc;
    }

}