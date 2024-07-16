import { ICard } from "glint-core/src/models.js";
import { GlobalState as GS } from "@state";
import {
    Body,
    Controller,
    Request,
    Post,
    Route,
} from "tsoa";
import { WithId, Document, ObjectId } from "mongodb";
import * as exp from "express";

/** 
* Fields for Updating a card.
*/

interface CardUpdates extends ICard {
    id: string;
}

type UpdateCardParams = CardUpdates;

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = (T & WithId<Document>);

interface UpdateCardErrorResponse {
    message: string
}

@Route("/api/v1/update")
export class UpdateCardController extends Controller {

    @Post()
    public async updateCard(@Body() body: UpdateCardParams, @Request() req: exp.Request) {


        // Attempt to update an existing card
        let updateResult = await col("card").findOneAndUpdate(
            {
                "_id": new ObjectId(body.id)
            },
            {
                $set:
                {
                    "side_front": body.side_front,
                    "side_back": body.side_back
                }
            }
        )

        // Respond with internal server error if could not insert
        if (updateResult === null) {
            this.setStatus(500);
            let resp: UpdateCardErrorResponse = {
                message: "unable to update card"
            };
            return resp;
        }

        return;
    }

}