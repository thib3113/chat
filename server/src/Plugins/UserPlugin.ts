import { IPlugin } from './IPlugin';
import { IPluginHelp } from './IPluginHelp';
import { Users } from '../Users';
import { CLISanitize, sendMSGAsSystem } from '../utils';
import { UserException } from '../Exceptions';
import { IPluginContext } from './IPluginContext';
import { EPluginEvents } from './EPluginEvents';
import path from 'path';
import { root } from '../root';
import * as fs from 'fs';

export enum EUserPluginCommands {
    NICK = 'nick',
    WHOAMI = 'whoami'
}

const accessLogPath = path.join(root, '..', 'access.log');

export class UserPlugin implements IPlugin {
    commands: Array<EUserPluginCommands> = Object.values(EUserPluginCommands).filter((cmd) => !Number.isInteger(cmd));

    getHelp(cmd: string): IPluginHelp {
        switch (cmd as EUserPluginCommands) {
            case EUserPluginCommands.NICK:
                return {
                    description: 'set your nickname',
                    parameters: ['nick']
                };
            case EUserPluginCommands.WHOAMI:
                return {
                    description: 'show your nickname'
                };
            default:
                return {
                    description: 'no description'
                };
        }
    }

    async handleCommand(pCmd: string, args: string, context: IPluginContext): Promise<void> {
        const { socket, user } = context;
        const cmd = pCmd as EUserPluginCommands;

        const existingUser = Users.getFromNickName(args);

        if (cmd === EUserPluginCommands.NICK) {
            if (existingUser && existingUser.socket != socket.id) {
                throw new UserException('this nickName is already in use, please choose another one');
            }

            let oldNickName: string | null = user.nickName;
            user.nickName = CLISanitize(args);
            socket.emit('set_nickname', user.nickName);

            if (oldNickName) {
                socket.emit('msg', sendMSGAsSystem(`You are now @${user.nickName}`));
                socket.broadcast.emit('msg', sendMSGAsSystem(`@${oldNickName} just renamed to @${user.nickName}`));
                console.log(`user ${oldNickName} just renamed to ${user.nickName} (id:${socket.id})`);
            } else {
                socket.emit('msg', sendMSGAsSystem(`Hello @${user.nickName}`));
                socket.broadcast.emit('msg', sendMSGAsSystem(`@${user.nickName} just connected`));

                const log = `user ${user.nickName} just connected (id:${socket.id})`;
                console.log(log);
                //log to file
                this.logToFile(log);
            }
        }

        if (cmd === EUserPluginCommands.WHOAMI) {
            if (user.nickName) {
                socket.emit('msg', sendMSGAsSystem(`your nickName is @${user.nickName}`));
            } else {
                socket.emit('msg', sendMSGAsSystem(`you doesn't have a nickName. Use command /nick`));
            }
        }
    }

    filterText(str: string, context: IPluginContext): string {
        const { user } = context;
        // check if user has a nickName
        if (!user.nickName || !user.nickName.trim()) {
            throw new UserException('you need to set a nickName before posting .\n Use /nick <name> to set a nickName');
        }

        return str;
    }

    /**
     * log the current string to the access Log
     * @param str
     */
    logToFile(str) {
        console.log(accessLogPath);
        fs.appendFileSync(accessLogPath, `${str}\n`);
    }

    handleEvents(event: EPluginEvents, context: IPluginContext): void {
        const { socket, user } = context;
        if (event === EPluginEvents.DISCONNECTION) {
            if (user.nickName) {
                socket.broadcast.emit('msg', sendMSGAsSystem(`@${user.nickName} just disconnected`));

                const log = `user ${user.nickName} just disconnected (id:${socket.id})`;
                console.log(log);
                //log to file
                this.logToFile(log);
            }
            Users.delete(socket.id);
        }
    }
}
