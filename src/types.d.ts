import { JwtPayload } from "jsonwebtoken"

export { }

export interface CustomJwt extends JwtPayload {
    sub: string
}

declare global {
    namespace Express {
        interface Locals {
            jwt: CustomJwt
        }
    }
}