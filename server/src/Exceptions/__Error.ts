import path from 'path';

/**
 * custom error base
 */
export class __Error implements Error {
    public stack: string;
    protected _message: string;
    /**
     * can also contains error like certificates error (https://nodejs.org/api/tls.html#tls_x509_certificate_error_codes) or other errors . Can be a string, or a number
     */
    public errorCode: number | string;
    /**
     * can also contains error like certificates error (https://nodejs.org/api/tls.html#tls_x509_certificate_error_codes) or other errors . Can be a string, or a number
     */
    public code: number | string;
    public exception: Error;
    public message: string;

    public constructor(message: string | Error = '', code: number | string = 500, exception?: Error | string | null) {
        if (message instanceof Error) {
            exception = message;
            message = message.message;
        }

        this.errorCode = code;
        this.code = code;

        const generateStack = (): string => {
            let tmpStack = new Error().stack || '';
            if (this.exception) {
                tmpStack += '\n=== CAUSED BY ===\n';
                tmpStack += `${this.exception.toString()}`;
            }
            const stack = tmpStack
                .split('\n')
                .filter(
                    (line): boolean => !line.match(new RegExp(`${path.basename(__filename).replace(/\.js$/, '.ts')}:[0-9]+:[0-9]+\\)`, 'g'))
                );
            //remove two last line from stack
            return `${this.name} : ${this._message}\n${stack.join('\n')}`;
        };

        this._message = message;
        this.message = this._message;
        this.exception = typeof exception === typeof '' ? new Error(exception as string) : (exception as Error);

        this.stack = generateStack();
    }

    public toString = (): string => {
        const obj = Object(this);
        if (obj !== this) {
            throw new TypeError();
        }

        const name = this.name || 'Error';

        const message = String(this._message) || '';

        const strComponents: Array<string> = [];

        const errorCodeStr = this.errorCode ? ` (${this.errorCode})` : '';

        strComponents.push(`${name}${errorCodeStr} : ${message} \n`);

        strComponents.push(this.stack);

        return strComponents.join(' ');
    };

    name: string = 'Error';
}
