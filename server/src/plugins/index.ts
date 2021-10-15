import { IPlugin } from './IPlugin';
import { UserPlugin } from './UserPlugin';
import { HelpPlugin } from './HelpPlugin';

export const plugins: Array<new () => IPlugin> = [];

export const internalPlugins: Array<new () => IPlugin> = [];
internalPlugins.push(UserPlugin);
internalPlugins.push(HelpPlugin);
