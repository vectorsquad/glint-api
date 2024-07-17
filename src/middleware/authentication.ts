import { GlobalState } from "@state";
import { NextFunction, Request, Response } from "express"
import * as jwt from "jsonwebtoken";

function isApiRequest(path: string) {
    return path.startsWith("/api/v1");
}

function MiddlewareAuthentication(req: Request, res: Response, next: NextFunction) {

    // If request is not for an API, then always allow.
    if (!isApiRequest(req.path)) {
        next();
        return;
    }

    let auth_cookie = req.cookies["auth"];

    let auth_jwt: string | jwt.JwtPayload;

    try {
        auth_jwt = jwt.verify(auth_cookie, GlobalState.jwt.secret);

    } catch (e) {
        res.send(e);
        return;

    }

    if (typeof auth_jwt === "string") {
        res.send("unable to authenticate; `auth` could only be coerced as a string");
        return;
    }

    res.locals.jwt = auth_jwt as typeof res.locals.jwt;

    next();
}