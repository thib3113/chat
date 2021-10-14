import { IPlugin } from './IPlugin';
import { IPluginHelp } from './IPluginHelp';
import { User, Users } from '../Users';
import { Server, Socket } from 'socket.io';
import { CLISanitize, sendMSGAsSystem } from '../utils';
import { UserException } from '../Exceptions/UserException';

enum EUserPluginCommands {
    NICK = 'nick',
    WHOAMI = 'whoami'
}

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

    async handle(pCmd: string, args: string, user: User, socket: Socket, socketServer: Server): Promise<void> {
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
                socket.emit('msg', sendMSGAsSystem(`Bonjour @${user.nickName}`));
                socket.broadcast.emit('msg', sendMSGAsSystem(`@${user.nickName} vient de se connecter`));
                console.log(`user ${user.nickName} just connected (id:${socket.id})`);
            }
        }

        if (cmd === EUserPluginCommands.WHOAMI) {
            socket.emit('msg', sendMSGAsSystem(`your nickName is @${user.nickName}`));
        }
    }

    modifyText(str: string, user: User, socket: Socket, socketServer: Server): string {
        // check if user has a nickName
        if (!user.nickName || !user.nickName.trim()) {
            throw new UserException('you need to set a nickName before posting .\n Use /nick <name> to set a nickName');
        }

        return str;
    }

    handleDisconnection(user: User, socket: Socket, socketServer: Server): void {
        if (user.nickName) {
            socket.broadcast.emit('msg', sendMSGAsSystem(`@${user.nickName} vient de se déconnecter`));
            console.log(`user ${user.nickName} just disconnected (id:${socket.id})`);
        }
    }
}
