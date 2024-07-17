import {
    Body,
    Controller,
    Post,
    Request,
    Route,
} from "tsoa";
import { ObjectId, } from "mongodb";
import * as exp from "express";
import { col } from "../utils";

/** 
* Fields for Deleting a card.
*/
interface CardDelete {
    id: string;
}

type DeleteCardParams = CardDelete;

interface DeleteCardErrorResponse {
    message: string
}

@Route("/api/v1/delete")
export class DeleteCardController extends Controller {

    @Post()
    public async deleteCard(@Body() body: DeleteCardParams, @Request() req: exp.Request) {

        // Attempt to delete a card
        let deleteResult = await col("card").findOneAndDelete({ "_id": new ObjectId(body.id) })

        // Respond with internal server error if could not insert
        if (deleteResult === null) {
            this.setStatus(500);
            let resp: DeleteCardErrorResponse = {
                message: "database delete of card was not acknowledged"
            };
            return resp;
        }

        return;
    }

}