export default class PersistenceError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, PersistenceError.prototype);
    }
}