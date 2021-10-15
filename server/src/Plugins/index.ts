import type { IPlugin } from './IPlugin';
import { UserPlugin } from './UserPlugin';
import { HelpPlugin } from './HelpPlugin';

export const plugins: Array<new () => IPlugin> = [];

export const internalPlugins: Array<new () => IPlugin> = [];
internalPlugins.push(UserPlugin);
internalPlugins.push(HelpPlugin);

export * from './EPluginEvents';
export * from './HelpPlugin';
export * from './IPlugin';
export * from './IPluginContext';
export * from './IPluginHelp';
export * from './UserPlugin';
