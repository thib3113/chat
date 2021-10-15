import type { IPluginHelp } from './IPluginHelp';
import type { IPluginContext } from './IPluginContext';
import type { EPluginEvents } from './EPluginEvents';

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
     * @param context - {@link IPluginContext}
     */
    handleCommand(cmd: string, args: string, context: IPluginContext): Promise<void>;

    /**
     * handle / modify a text from a user
     * @param text - the text
     * @param context - {@link IPluginContext}
     */
    filterText?: (text: string, context: IPluginContext) => string;

    /**
     * handle the disconnection of an user
     * @param event - {@link EPluginEvents}
     * @param context - {@link IPluginContext}
     */
    handleEvents?: (event: EPluginEvents, context: IPluginContext) => void;
}
