import * as fs from 'fs';
import * as restify from 'restify';
import * as path from 'path';
import { config } from './env';
import { logger } from '../utils/logger';

// get path to route handlers
const pathToRoutes: string = path.join(config.root, '/app/routes');

// create Restify server with the configured name
const app: restify.Server = restify.createServer({ name: config.name });

// parse the body of the request into req.params
app.use(restify.bodyParser());

// user-defined middleware
app.use((req: any, res: any, next: any) => {
  // Set permissive CORS header - this allows this server to be used only as
  // an API server in conjunction with something like webpack-dev-server.
  res.setHeader('Access-Control-Allow-Origin', '*');

  res.header('Access-Control-Allow-Headers', 'Content-Type, Content-Length, Authorization, Accept, X-Requested-With ,yourHeaderFeild, AccessToken');
  res.header('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE, OPTIONS');

  if (req.method == 'OPTIONS') {
		// 跨域并设置headers的请求，所有请求需要两步完成！
		// 第一步：发送预请求 OPTIONS 请求。此时 服务器端需要对于OPTIONS请求作出响应 一般使用202响应即可 不用返回任何内容信息。
		// res.status(200);
		res.sendStatus(204);
  } else {
    next();
  }

  // disable caching so we'll always get the latest data
  res.setHeader('Cache-Control', 'no-cache');

  // log the request method and url
  logger.info(`${req.method} ${req.url}`);

  // log the request body
  logger.info(`Params: ${JSON.stringify(req.params)}`);

  return next();
});

// add route handlers
// fs.readdir(pathToRoutes, (err: any, files: string[]) => {
//   if (err) {
//     throw new Error(err);
//   } else {
//     files
//       .filter((file: string) => path.extname(file) === '.js')
//       .forEach((file: string) => {
//         const route = require(path.join(pathToRoutes, file));
//         route.default(app);
//       });
//   }
// });

export { app };
