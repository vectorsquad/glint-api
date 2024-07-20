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

@Route("/api/v1/update")
export class UpdateCardController extends Controller {

    @Post()
    public async updateCard(@Body() body: models.IUpdateCardRequest, @Request() req: exp.Request) {


        // Attempt to update an existing card
        let updateResult = await col("card").findOneAndUpdate(
            {
                "_id": new ObjectId(body._id)
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
            let resp: models.ErrorResponse = {
                message: "Server could not update card."
            };
            return resp;
        }

        return;
    }

}