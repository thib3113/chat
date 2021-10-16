import { IMessage } from './IMessage';

/**
 * this function will sanitize . But limit to ASCII
 * @TODO allow UTF-8 ?
 * @param str - the string to sanitize
 * @constructor
 */
export function CLISanitize(str: string) {
    return str.replace(/[^ -~]+/g, '');
}

//move this to a class ?
export function sendMSGAsSystem(msg): IMessage {
    return {
        user: 'system',
        user_color: 'red',
        msg
    };
}

export const formatTime = (ms: number) =>
    new Date(ms).toLocaleTimeString('en-GB', {
        timeZone: 'Etc/UTC',
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
