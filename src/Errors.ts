import { Location } from './ast/Location';
export class CashScriptError extends Error {
    constructor(
        public location?: Location
    ) {
        super()
    }
}
