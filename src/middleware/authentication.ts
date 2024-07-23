import { NextFunction, Request, Response } from "express"
import { getJwt } from "../utils";

function isApiRequest(path: string) {
    return path.startsWith("/api/v1");
}

const whitelistedApiRoutes = [
    "register",
    "login",
    "sendPasswordRecovery",
    "verify",
];

function isWhitelistedRequest(path: string) {

    for (const whitelistedRoute of whitelistedApiRoutes) {
        if (path.startsWith(`/api/v1/${whitelistedRoute}`)) {
            return true;
        }
    }

    return false;
}

export function Authenticate(req: Request, res: Response, next: NextFunction) {

    // If request is not for any API, or is for a whitelisted API, allow request.
    if (!isApiRequest(req.path) || isWhitelistedRequest(req.path)) {
        next();
        return;
    }

    // Get JWT from request; if cannot retrieve, deny request.
    let user_jwt = getJwt(req);

    if (user_jwt === undefined) {
        return;
    }

    // Store JWT for later usage in subsequent middleware/endpoints.
    res.locals.jwt = user_jwt;

    next();
}