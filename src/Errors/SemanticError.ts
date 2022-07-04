export default class SemanticError extends Error {
    constructor(msg: string) {
        super(msg);
        Object.setPrototypeOf(this, SemanticError.prototype);
    }
}