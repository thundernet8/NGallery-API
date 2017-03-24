"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const env_1 = require("./config/env");
const restify_1 = require("./config/restify");
exports.app = restify_1.app;
const logger_1 = require("./utils/logger");
mongoose.Promise = global.Promise;
const options = { server: { socketOptions: { keepAlive: 1 } } };
const db = mongoose.connect(env_1.config.db, options).connection;
if (env_1.config.debug) {
    mongoose.set('debug', true);
}
db.on('error', (err) => {
    throw new Error(`Unable to connect to database: ${err}`);
});
db.once('open', () => {
    logger_1.logger.info(`Connected to database: ${env_1.config.db}`);
    restify_1.app.listen(env_1.config.port, () => {
        logger_1.logger.info(`${env_1.config.name} is running at ${restify_1.app.url}`);
    });
    restify_1.app.get('/api', (req, res, next) => {
        res.json(200, 'test');
        return next();
    });
});
//# sourceMappingURL=server.js.map