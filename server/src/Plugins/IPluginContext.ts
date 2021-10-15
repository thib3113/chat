import type { User } from '../Users';
import type { Socket } from 'socket.io';
import type { PluginInitializer } from '../PluginInitializer';

export interface IPluginContext {
    user: User;
    socket: Socket;
    pluginInitializer: PluginInitializer;
}
