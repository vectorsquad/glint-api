import { Db, MongoClient } from "mongodb";
import { randId } from "../utils";

let host = process.env.MONGO_HOST || "127.0.0.1";
let port = process.env.MONGO_PORT ? ":" + process.env.MONGO_PORT : "";

let mongo_url = `mongodb://${host}${port}`

const gs = {
    jwt: {
        secret: randId(20)
    },
    mongo: {
        client: new MongoClient(mongo_url),
        db: {} as Db,
        mongo_url: mongo_url
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
