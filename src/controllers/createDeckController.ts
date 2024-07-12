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

interface DeckResponse {
    id: ObjectId | null,
    userId: ObjectId | null,
    name: string,
    message: string
}

interface CreateDeckParams {
    user_id: string,
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

@Route("/api/v1/createDeck")
export class CreateDeckController extends Controller {

    @Post()
    public async createDeck(@Body() body: CreateDeckParams, @Request() req: exp.Request) {

        var user_id = new ObjectId(body.user_id);

        let deck = (await col("deck").findOne({ "name":body.deck_name, "id_user": user_id })) as Doc<IDeck> | null

        if(deck !== null)
        {
            this.setStatus(400);
            let res:DeckResponse = {
                id: deck._id,
                userId: deck.id_user,
                name: deck.name,
                message: "Error: A deck with this name already exists"
            }; 
            return res;
        }

        deck = {
            id_user: user_id,
            name: body.deck_name
        };

        let insertDeckDB = await col("deck").insertOne(deck);

        if(!insertDeckDB.acknowledged) {
            this.setStatus(502);
                let res:DeckResponse = {
                    id: null,
                    userId: null,
                    name: "",
                    message: "Error: Could not add the deck to the database"
                }; 
                return res;
        }

        this.setStatus(200);
        let resp:DeckResponse = {
            id: deck._id,
            userId: user_id,
            name: deck.name,
            message: "Success: The deck was created"
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

        return resp;
    }

}