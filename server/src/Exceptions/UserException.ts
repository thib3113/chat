import {__Error} from "./__Error";

/**
 * describe an error coming from the user
 */
export class UserException extends __Error {
    public constructor(message: string | Error = '', code: number | string = 400, exception?: Error | string | null) {
        super(message, code, exception);
    }
}