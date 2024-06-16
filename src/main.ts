import * as exp from "express";
import sw_ui from "swagger-ui-express";
import { RegisterRoutes } from "@routes";
import spec from "@spec";
import { GlobalState as GS } from "@state";
import { ValidateError } from "tsoa";

// Initiate connection to MongoDB
await GS.mongo_client.connect();

// Default express app
const app = exp.default();

// API routes
RegisterRoutes(app);

// API docs
app.use("/api/docs", sw_ui.serve);
app.get("/api/docs", sw_ui.setup(spec));

// Error handling middleware
app.use(function errorHandler(
    err: unknown,
    req: exp.Request,
    res: exp.Response,
    next: exp.NextFunction
): exp.Response | void {
    if (err instanceof ValidateError) {
        console.warn(`Caught Validation Error for ${req.path}:`, err.fields);
        return res.status(422).json({
            message: "Validation Failed",
            details: err?.fields,
        });
    }
    if (err instanceof Error) {
        return res.status(500).json({
            message: "Internal Server Error",
        });
    }

    next();
});


// Blocking listen.
app.listen(GS.api.port, GS.api.address, () => {
    console.log(`Listening on ${GS.api.address}:${GS.api.port}`);
})
