import * as restify from 'restify'

interface IController {
    load?: (req: restify.Request, res: restify.Response, next: restify.Next) => any;
    get?: (req: restify.Request, res: restify.Response, next: restify.Next) => any;
    create: (req: restify.Request, res: restify.Response, next: restify.Next) => any;
    update?: (req: restify.Request, res: restify.Response, next: restify.Next) => any;
    remove?: (req: restify.Request, res: restify.Response, next: restify.Next) => any;
}

export default IController
