import { GlobalState } from "@state";
import { NextFunction, Request, Response } from "express"
import * as jwt from "jsonwebtoken";

function isApiRequest(path: string) {
    return path.startsWith("/api/v1");
}

const whitelistedApiRoutes = ["register", "login", "sendEmailVerification", "sendPasswordRecovery"];

function isWhitelistedRequest(path: string) {

    for (const whitelistedRoute of whitelistedApiRoutes) {
        if (path.startsWith(`/api/v1/${whitelistedRoute}`)) {
            return true;
        }
    }

    return false;
}

export function Authenticate(req: Request, res: Response, next: NextFunction) {

    // If request is not for any API, or is for a whitelisted API, allow.
    if (!isApiRequest(req.path) || isWhitelistedRequest(req.path)) {
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