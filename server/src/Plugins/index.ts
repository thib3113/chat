import type { IPlugin } from './IPlugin';
import { UserPlugin } from './UserPlugin';
import { HelpPlugin } from './HelpPlugin';
import { MetricsPlugin } from './MetricsPlugin';

/**
 * Here will be a list of plugins constructor
 */
export const plugins: Array<new (...args) => IPlugin> = [];

/**
 * Here will be a list of internal plugins constructor
 */
export const internalPlugins: Array<new (...args) => IPlugin> = [];
internalPlugins.push(UserPlugin);
internalPlugins.push(HelpPlugin);
internalPlugins.push(MetricsPlugin);

// exports
export * from './EPluginEvents';
export * from './HelpPlugin';
export * from './IPlugin';
export * from './IPluginContext';
export * from './IPluginHelp';
export * from './UserPlugin';
