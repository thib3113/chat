import { Socket } from 'socket.io';
import { User } from './User';

export class Users {
    private static users: Map<string, User> = new Map<string, User>();

    /**
     * create an user with this socket id
     * @param socket - the socket Id
     */
    public static createNew(socket: Socket) {
        this.users.set(socket.id, new User(socket.id));
    }

    /**
     * get an user by it's socket id
     * @param id - the socket id
     */
    static getFromSocket(id: string): User | undefined {
        return this.users.get(id);
    }

    /**
     * get an user by it's nickName
     * @param nickName - the nickName
     */
    static getFromNickName(nickName: string): User | undefined {
        return (
            Array.from(this.users)
                // move [key, value] to value
                .map(([, u]) => u)
                //find with nickName, and return user if found
                .find((u) => u.nickName === nickName)
        );
    }

    /**
     * delete an user
     * @param id - the socket id
     */
    static delete(id: string): boolean {
        return this.users.delete(id);
    }

    /**
     * return all the users
     */
    static getAll(): Array<User> {
        const users: Array<User> = [];
        this.users.forEach((u) => users.push(u));
        return users;
    }
}
