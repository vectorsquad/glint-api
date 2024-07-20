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

@Route("/api/v1/find")
export class FindCardController extends Controller {

    @Post()
    public async findCard(@Body() body: models.IFindCardRequest, @Request() req: exp.Request) {

        // Retrieve card
        let cardDoc = await col("card").findOne({ side_front: { $regex: body.side_front }, side_back: { $regex: body.side_back } }) as models.ICardDoc | null;

        // Error early if unable to retrieve card
        if (cardDoc === null) {
            this.setStatus(500);
            let resp: models.ErrorResponse = {
                message: "Server could not find card."
            };
            return resp;
        }

        return cardDoc._id;
    }

}