import { Db, MongoClient } from "mongodb";
import * as jwt from "jsonwebtoken";

let host = process.env.MONGO_HOST || "127.0.0.1";
let port = process.env.MONGO_PORT ? ":" + process.env.MONGO_PORT : "";

let mongo_url = `mongodb://${host}${port}`

const gs = {
    authenticated: new Map<string, jwt.Jwt>(),
    mongo: {
        client: new MongoClient(mongo_url),
        db: {} as Db
    },
    api: {
        address: "0.0.0.0",
        port: 8080
    }
};

gs.mongo.client.on("open", async () => {
    gs.mongo.db = gs.mongo.client.db("glint");
});

export const GlobalState = gs;
