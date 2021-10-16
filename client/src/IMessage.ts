/**
 * this interface describe a message object send between client and server
 * /!\ WARNING this interface is actually duplicated in server
 */
export interface IMessage {
    user: string;
    user_color: string;
    msg: string;
}
