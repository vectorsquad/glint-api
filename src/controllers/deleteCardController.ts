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
import * as models from "glint-core/src/models";

@Route("/api/v1/delete")
export class DeleteCardController extends Controller {

    @Post()
    public async deleteCard(@Body() body: models.IDeleteCardRequest, @Request() req: exp.Request) {

        // Attempt to delete a card
        let deleteResult = await col("card").findOneAndDelete({ "_id": new ObjectId(body._id) })

        // Respond with internal server error if could not insert
        if (deleteResult === null) {
            this.setStatus(500);
            let resp: models.ErrorResponse = {
                message: "Server could not delete card."
            };
            return resp;
        }

        return;
    }

}