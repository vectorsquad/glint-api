import { MongoClient } from "mongodb";

const gs = {
    mongo_client: new MongoClient("mongodb://root:root@127.0.0.1:27017"),
    api: {
        address: "0.0.0.0",
        port: 8080
    }
};

gs.mongo_client.on("connectionCreated", () => console.log("Successfully created MongoDB connection"));

export const GlobalState = gs;
