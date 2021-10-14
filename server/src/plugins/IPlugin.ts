import { IPluginHelp } from './IPluginHelp';
import { User } from '../Users';
import { Server, Socket } from 'socket.io';

export interface IPlugin {
    /**
     * list of commands for this plugin
     */
    commands: Array<string>;

    /**
     * return the help message / possible arguments for this function
     * @param cmd - the command
     */
    getHelp(cmd: string): IPluginHelp;

    /**
     * Handle function for this command
     * @param cmd - the current command
     * @param args - the other args for this command
     * @param user - the current user
     * @param socket - the current socket
     * @param socketServer - the global socketServer
     */
    handle(cmd: string, args: string, user: User, socket: Socket, socketServer: Server): Promise<void>;

    /**
     * handle / modify a text from a user
     * @param text - the text
     * @param user - the current user
     * @param socket - the current socket
     * @param socketServer - the global socketServer
     */
    modifyText?: (text: string, user: User, socket: Socket, socketServer: Server) => string;

    /**
     * handle the disconnection of an user
     * @param user - the current user
     * @param socket - the current socket
     * @param socketServer - the global socketServer
     */
    handleDisconnection?: (user: User, socket: Socket, socketServer: Server) => void;
}
