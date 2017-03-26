// http://stackoverflow.com/questions/42263363/how-do-we-declare-import-types-from-npm-library-that-has-no-declaration-files

declare module "compression" {
    var compression: ()=>(req: any, res: any, next: any) => void
    export = compression
}

declare module "helmet" {
    var helmet: ()=>(req: any, res: any, next: any) => void
    export = helmet
}

declare module "jwt-simple" {
    export function encode(payload: object, secret: string): any
    export function decode(token: string, secret: string): any
}

declare module "md5" {
    var md5: (msg: string) => string
    export = md5
}
