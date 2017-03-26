// http://nodewebapps.com/2017/02/13/six-best-practices-when-building-rest-apis/
enum HttpStatus {
    OK = 200,
    CREATED = 201,
    NOCONTENT = 204,
    INVALIDREQUEST = 400,
    UNAUTHORIZED = 401,
    FORBIDDEN = 403,
    NOTFOUND = 404,
    INTERNALSERVERERROR = 500
}

export default HttpStatus
