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

interface SwapFilter {
    _id: ObjectId
}

@Route("/api/v1/swapCards")
export class SwapCardController extends Controller {

    @Post()
    public async swapCard(@Body() body: models.ISwapCardsRequest, @Request() req: exp.Request) {

        let filterCardFirst: SwapFilter = {
            _id: new ObjectId(body.card_first._id)
        };

        let cardFirst = await col("card").findOne(filterCardFirst) as models.ICardDoc | null;

        let filterCardSecond: SwapFilter = {
            _id: new ObjectId(body.card_second._id)
        }

        let cardSecond = await col("card").findOne(filterCardSecond) as models.ICardDoc | null;

        if (!cardFirst) {
            this.setStatus(400);
            let res: models.ErrorResponse = {
                message: "Could not find first card."
            }
            return res;
        }

        if (!cardSecond) {
            this.setStatus(400);
            let res: models.ErrorResponse = {
                message: "Could not find second card."
            }
            return res;
        }

        let updateFirst = await col("card").updateOne(cardFirst, {
            $set: {
                deck_index: cardSecond.deck_index
            }
        });

        let updateSecond = await col("card").updateOne(cardFirst, {
            $set: {
                deck_index: cardFirst.deck_index
            }
        });

        if (!updateFirst.acknowledged || !updateSecond.acknowledged) {
            this.setStatus(500);
            let res: models.ErrorResponse = {
                message: "Could not swap card indices."
            }
            return res;
        }

        let res: models.ISwapCardsResponse = {
            card_first: {
                deck_index: cardSecond.deck_index
            },
            card_second: {
                deck_index: cardFirst.deck_index
            }
        }

        return res;

    }

}