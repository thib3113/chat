import { UserException } from '../Exceptions/UserException';
import { CLIColors } from '../global';

export class User {
    color: string;
    public get nickName(): string {
        return this._nickName;
    }

    public set nickName(pNickName: string) {
        const nickName = pNickName?.trim();
        //check nickName
        if (!nickName) {
            throw new UserException('you need to pass a valid nickname');
        }

        if (nickName.length > 20) {
            throw new UserException(`you're nickName is too long, 20 chars maximum`);
        }
        this._nickName = nickName;
    }

    private _nickName: string;
    public readonly socket: string;
    constructor(socket: string) {
        this.socket = socket;
        this.color = CLIColors[Math.floor(Math.random() * CLIColors.length)];
    }
}
