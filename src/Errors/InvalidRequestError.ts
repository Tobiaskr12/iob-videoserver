export default class InvalidRequestError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, InvalidRequestError.prototype);
    }
}