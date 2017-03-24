"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const restify = require("restify");
const path = require("path");
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
const pathToRoutes = path.join(env_1.config.root, '/app/routes');
const app = restify.createServer({ name: env_1.config.name });
exports.app = app;
app.use(restify.bodyParser());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With ,yourHeaderFeild, AccessToken');
    res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');
    if (req.method == 'OPTIONS') {
        res.sendStatus(204);
    }
    else {
        next();
    }
    res.setHeader('Cache-Control', 'no-cache');
    logger_1.logger.info(`${req.method} ${req.url}`);
    logger_1.logger.info(`Params: ${JSON.stringify(req.params)}`);
    return next();
});
//# sourceMappingURL=restify.js.map