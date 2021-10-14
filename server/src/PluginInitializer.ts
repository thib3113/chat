import { plugins } from './plugins';
import { Server, Socket } from 'socket.io';
import { IPlugin } from './plugins/IPlugin';
import { UserException } from './Exceptions/UserException';
import { Users } from './Users';
import { CLISanitize, sendMSGAsSystem } from './utils';
import { IMessage } from './IMessage';

export class PluginInitializer {
    private plugins: Array<IPlugin>;
    private socketServer: Server;

    constructor(socketServer: Server) {
        this.socketServer = socketServer;
        this.plugins = Object.values<new () => IPlugin>(plugins).map((plugin) => new plugin());
    }

    private errorHandler(e: Error, socket: Socket) {
        console.error(e);
        if (e instanceof UserException) {
            socket.emit('msg', sendMSGAsSystem(e.message));
        } else {
            socket.emit('msg', sendMSGAsSystem('unknown error'));
        }
    }

    addToSocket(socket: Socket) {
        socket.on('cmd', async (text) => {
            try {
                const textSplit = text.split(' ');
                const cmd = textSplit.shift()?.substr(1);
                //search this command in plugins
                const plugin = this.plugins.find((p) => p.commands.includes(cmd));

                if (!plugin) {
                    throw new UserException(`unknown command /${cmd}`);
                }

                //get current user
                const user = Users.getFromSocket(socket.id);
                if (!user) {
                    throw new Error('fail to get user');
                }

                //call the handle function of the plugin selected
                await plugin.handle(cmd, textSplit.join(' '), user, socket, this.socketServer);
            } catch (e) {
                this.errorHandler(e, socket);
            }
        });

        socket.on('msg', async (pText) => {
            try {
                let text = pText;
                //get current user
                const user = Users.getFromSocket(socket.id);
                if (!user) {
                    throw new Error('fail to get user');
                }

                text = CLISanitize(text);

                this.plugins.forEach((p) => {
                    text = p.modifyText ? p.modifyText(text, user, socket, this.socketServer) : text;
                });

                const msg = {
                    user: user.nickName,
                    user_color: user.color,
                    msg: text
                } as IMessage;
                socket.broadcast.emit('msg', msg);
                socket.emit('msg', msg);
            } catch (e) {
                this.errorHandler(e, socket);
            }
        });
    }

    removeFromSocket(socket: Socket) {
        try {
            //get current user
            const user = Users.getFromSocket(socket.id);
            if (!user) {
                throw new Error('fail to get user');
            }

            this.plugins.forEach((p) => {
                p.handleDisconnection ? p.handleDisconnection(user, socket, this.socketServer) : '';
            });

            Users.delete(socket.id);
        } catch (e) {
            this.errorHandler(e, socket);
        }
    }
}
