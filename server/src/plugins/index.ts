import { IPlugin } from './IPlugin';
import { UserPlugin } from './UserPlugin';

export const plugins: Array<new () => IPlugin> = [];

plugins.push(UserPlugin);
