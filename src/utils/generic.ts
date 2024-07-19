import { GlobalState } from "@state";
import { CustomJwt } from "../types";
import { Request } from "express";
import * as jwt from "jsonwebtoken";

export function randId(length: number) {
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

export function col(collection_name: string) {
    return GlobalState.mongo.db.collection(collection_name);
}

export function getJwt(req: Request): CustomJwt | undefined {

    let cookie_jwt = req.cookies["auth"];
    if (cookie_jwt === undefined) {
        return undefined;
    }

    try {
        let verified_jwt = jwt.verify(cookie_jwt, GlobalState.jwt.secret);
        if (typeof verified_jwt === "string") {
            return undefined;
        }

        return verified_jwt as CustomJwt;

    } catch (e) {
        return undefined;
    }

}