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

@Route("/api/v1/updateDeck")
export class UpdateDeckController extends Controller {

    @Post()
    public async FindDeck(@Body() body: models.IUpdateDeckRequest, @Request() req: exp.Request) {

        const user_id = new ObjectId(req.res?.locals.jwt.sub);
        var deck_id = new ObjectId(body._id);

        let deck = (await col("deck").findOne({ "_id": deck_id, "id_user": user_id })) as models.IUserDoc | null

        if (deck === null) {
            this.setStatus(404);
            let res: models.ErrorResponse = {
                message: "Server could not find deck."
            };
            return res;
        }

        await col("deck").updateOne({ _id: deck._id }, { $set: { "name": body.name } });

        return;
    }

}