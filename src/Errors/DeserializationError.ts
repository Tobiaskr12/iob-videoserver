export default class DeserializationError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, DeserializationError.prototype);
    }
}