import { IUser } from "glint-core/src/models.js";
import { GlobalState as GS } from "@state";
import {
    Body,
    Controller,
    Request,
    Get,
    Header,
    Path,
    Post,
    Query,
    Route,
    SuccessResponse,
} from "tsoa";
import { ObjectId, WithId, Document } from "mongodb";
import jwt from "jsonwebtoken";
import * as exp from "express";

interface IDeck {
    _id: ObjectId,
    id_user: ObjectId,
    name: string
}

const col = (collection_name: string) => GS.mongo.db.collection(collection_name);

type Doc<T> = (T & WithId<Document>);

interface UpdateDeckResponse {
    id: ObjectId | null,
    userId: ObjectId | null,
    name: string,
    message: string
}

interface updateDeckParams {
    user_id: string,
    deck_id: string,
    deck_name: string
}

function randId(length: number) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    let counter = 0;
    while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
    }
    return result;
}

const jwtSecret = randId(20);

@Route("/api/v1/updateDeck")
export class UpdateDeckController extends Controller {

    @Post()
    public async FindDeck(@Body() body: updateDeckParams, @Request() req: exp.Request) {

        var user_id = new ObjectId(body.user_id);
        var deck_id = new ObjectId(body.deck_id);

        let deck = (await col("deck").findOne({ "_id": deck_id,"id_user": user_id })) as Doc<IDeck> | null

        if(deck === null)
        {
            this.setStatus(404);
            let res:UpdateDeckResponse = {
                id: null,
                userId: null,
                name: "",
                message: "Error: Deck not found"
            }; 
            return res;
        }

        await col("deck").updateOne({ _id: deck._id }, { $set: { "name":body.deck_name } });

        this.setStatus(200);
        let res:UpdateDeckResponse = {
            id: deck._id,
            userId: deck.id_user,
            name: deck.name,
            message: "Success: Deck name updated"
        }; 

        // Create JWT payload
        let authPayload = {
            sub: deck._id.toString(),
            exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 7 * 2)
        };

        // Sign payload
        let signedJwt = jwt.sign(authPayload, jwtSecret);

        // Set cookie header to contain JWT authentication payload
        this.setHeader("Set-Cookie", `auth=${signedJwt}`);

        return res;
    }

}