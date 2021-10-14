import { Socket } from 'socket.io';
import { User } from './User';

export class Users {
    private static users: Map<string, User> = new Map<string, User>();

    /**
     * @param socket - the socket Id
     */
    public static createNew(socket: Socket) {
        this.users.set(socket.id, new User(socket.id));
    }

    static getFromSocket(id: string): User | undefined {
        return this.users.get(id);
    }

    static getFromNickName(nickName: string): User | undefined {
        return (
            Array.from(this.users)
                // move [key, value] to value
                .map(([, u]) => u)
                //find with nickName, and return user if found
                .find((u) => u.nickName === nickName)
        );
    }

    static delete(id: string): boolean {
        return this.users.delete(id);
    }
}
