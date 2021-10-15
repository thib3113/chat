import { internalPlugins, plugins } from './plugins';
import { Server, Socket } from 'socket.io';
import { IPlugin, EPluginEvents } from './Plugins';
import { UserException } from './Exceptions';
import { Users } from './Users';
import { CLISanitize, sendMSGAsSystem } from './utils';
import { IMessage } from './IMessage';

export class PluginInitializer {
    get plugins(): Array<IPlugin> {
        return this._plugins;
    }
    private readonly _plugins: Array<IPlugin>;
    readonly socketServer: Server;

    get internalPlugins(): Array<IPlugin> {
        return this._internalPlugins;
    }
    private readonly _internalPlugins: Array<IPlugin>;

    constructor(socketServer: Server) {
        this.socketServer = socketServer;
        this._plugins = Object.values<new () => IPlugin>(plugins).map((plugin) => new plugin());
        this._internalPlugins = Object.values<new () => IPlugin>(internalPlugins).map((plugin) => new plugin());
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
                //search this command in plugins ( first search in internalPlugins, and then in plugins )
                const plugin =
                    this._internalPlugins.find((p) => p.commands.includes(cmd)) ?? this._plugins.find((p) => p.commands.includes(cmd));

                if (!plugin) {
                    throw new UserException(`unknown command /${cmd}`);
                }

                //get current user
                const user = Users.getFromSocket(socket.id);
                if (!user) {
                    throw new Error('fail to get user');
                }

                //call the handle function of the plugin selected
                await plugin.handleCommand(cmd, textSplit.join(' '), {
                    pluginInitializer: this,
                    user,
                    socket
                });
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

                [...this._internalPlugins, ...this._plugins].forEach((p) => {
                    text = p.filterText
                        ? p.filterText(text, {
                              pluginInitializer: this,
                              user,
                              socket
                          })
                        : text;
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

    handleEvent(event: EPluginEvents, socket: Socket): void {
        try {
            //get current user
            const user = Users.getFromSocket(socket.id);
            if (!user) {
                throw new Error('fail to get user');
            }

            this._plugins.forEach((p) => {
                p.handleEvents
                    ? p.handleEvents(event, {
                          pluginInitializer: this,
                          user,
                          socket
                      })
                    : '';
            });
        } catch (e) {
            this.errorHandler(e, socket);
        }
    }
}
