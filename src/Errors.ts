import { Location } from './Location';

export class CashScriptError extends Error {
    constructor(
        public location?: Location
    ) {
        super()
    }
}
