import { IPlugin } from './IPlugin';
import { IPluginHelp } from './IPluginHelp';
import { IPluginContext } from './IPluginContext';
import { sendMSGAsSystem } from '../utils';

export class HelpPlugin implements IPlugin {
    commands: Array<string> = ['help'];

    getHelp(cmd: string): IPluginHelp {
        return {
            description: 'show this help'
        };
    }

    async handleCommand(cmd: string, args: string, context: IPluginContext): Promise<void> {
        const { pluginInitializer, socket } = context;
        //get help parts
        const commandsHelps: Array<{ cmd: string; args: string; description?: string }> = [
            ...pluginInitializer.internalPlugins,
            ...pluginInitializer.plugins
        ]
            .map((p) =>
                p.commands.map((c) => {
                    const help = p.getHelp(c);
                    return {
                        cmd: c,
                        args: help.parameters && help.parameters.length > 0 ? `[${help.parameters.join('] [')}]` : '',
                        description: help.description
                    };
                })
            )
            .flat();

        //get command length / args length
        let commandLength = 0;
        let argsLength = 0;
        commandsHelps.forEach((h) => {
            if (h.cmd.length > commandLength) {
                commandLength = h.cmd.length;
            }
            if (h.args.length > argsLength) {
                argsLength = h.args.length;
            }
        });

        //sort
        commandsHelps.sort((a, b) => a.cmd.localeCompare(b.cmd));

        let msg = '';
        commandsHelps.forEach((h) => {
            msg += `\n/${h.cmd.padEnd(commandLength + 1)}${h.args.padEnd(argsLength)} ${h.description}`;
        });

        socket.emit('msg', sendMSGAsSystem(msg));
    }
}
