import type { User } from '../Users';
import type { Socket } from 'socket.io';
import type { PluginInitializer } from '../PluginInitializer';

/**
 * describe the context passed to the plugin functions
 */
export interface IPluginContext {
    /**
     * the current user
     */
    user: User;
    /**
     * the current socket
     */
    socket: Socket;
    /**
     * a reference to the plugin initializer instance
     */
    pluginInitializer: PluginInitializer;
}
