import { IPlugin } from './IPlugin';
import { IPluginHelp } from './IPluginHelp';
import { IPluginContext } from './IPluginContext';
import type { PluginInitializer } from '../PluginInitializer';
import { formatTime } from '../utils';
import { Users } from '../Users';
import { EPluginEvents } from './EPluginEvents';

export enum EMetricsCommands {
    PING_RESULT = 'ping_result'
}

export class MetricsPlugin implements IPlugin {
    commands: Array<string>;
    hiddenCommands: Array<EMetricsCommands> = [EMetricsCommands.PING_RESULT];
    private initializer: PluginInitializer;

    private messagesMetrics: Record<string, Array<{ length: number; timeStamp: number }>> = {};
    private startDate: Date;
    private userMetrics: Record<string, { ping: Array<number>; messages: Array<{ length: number }>; uptime: Date }> = {};
    // private pingMetrics: Record<string, Array<number>> = {};
    private totalMessages: number = 0;
    private words: Record<string, number> = {};

    /**
     * get messages from metrics, within the last X ms
     * @param ms
     */
    getMessageMetrics(ms: number = 5 * 60 * 1000): Array<{ length: number; timeStamp: number }> {
        return Object.values(this.messagesMetrics)
            .flat()
            .filter((m) => m.timeStamp > Date.now() - ms);
    }

    getMessageStats(ms: number = 5 * 60 * 1000): { number: number; avgSize: number } {
        const messageMetrics = this.getMessageMetrics(ms);
        return {
            number: messageMetrics.length,
            avgSize: messageMetrics.reduce((a, b) => a + b.length, 0) / messageMetrics.length || 0
        };
    }

    getPingAvg(user: string): number {
        const metrics = this.userMetrics[user] || [];
        return metrics.ping.reduce((a, b) => a + b, 0) / metrics.ping.length || 0;
    }

    constructor(initializer: PluginInitializer) {
        this.initializer = initializer;
        this.startDate = new Date();
        this.initializer.expressServer.get('/metrics', async (req, res) => {
            let status = 200;
            let data = {};

            //sort words
            const words = Object.entries(this.words).map(([word, uses]) => ({ word, uses }));
            words.sort((a, b) => b.uses - a.uses);
            const mostUsedWords = words.slice(0, 10);

            try {
                data = {
                    uptime: formatTime(Date.now() - this.startDate.getTime()),
                    totalMessages: this.totalMessages,
                    mostUsedWords,
                    messagesStats: {
                        fiveMinutes: this.getMessageStats(5 * 60 * 1000),
                        thirtyMinutes: this.getMessageStats(30 * 60 * 1000),
                        oneHour: this.getMessageStats(60 * 60 * 1000)
                    },
                    users: Users.getAll()
                        //get only user with a nickName
                        .filter((u) => u.nickName)
                        .map((u) => ({
                            nickName: u.nickName,
                            messagesInLastHour: this.messagesMetrics[u.socket]?.length,
                            pingAvg: this.getPingAvg(u.socket),
                            uptime: formatTime(Date.now() - this.userMetrics[u.socket].uptime.getTime())
                        }))
                };
            } catch (e) {}

            res.status(status).send(data);
        });
    }

    getHelp(cmd: string): IPluginHelp {
        return {
            description: ''
        };
    }

    handleEvents(event: EPluginEvents, context: IPluginContext) {
        const { user } = context;
        switch (event) {
            case EPluginEvents.CONNECTION:
                this.userMetrics[user.socket] = { ping: [], messages: [], uptime: new Date() };
                break;
            case EPluginEvents.DISCONNECTION:
                delete this.userMetrics[user.socket];
                break;
        }
    }

    handleCommand(pCmd: string, args: string, context: IPluginContext): Promise<void> {
        const cmd = pCmd as EMetricsCommands;
        if (cmd === EMetricsCommands.PING_RESULT) {
            //check if args is the ping result
            if (Number(args).toString() == args) {
                this.userMetrics[context.user.socket].ping.push(Number(args));
            }
        }
        return Promise.resolve(undefined);
    }
    filterText(text: string, context: IPluginContext) {
        try {
            //stats totalMessages
            ++this.totalMessages;

            //stats by user
            //check if metrics exist for this user
            if (!this.messagesMetrics[context.user.socket]) {
                this.messagesMetrics[context.user.socket] = [];
            }
            this.messagesMetrics[context.user.socket].push({
                length: text.length,
                timeStamp: Date.now()
            });

            //remove too old metrics
            this.messagesMetrics[context.user.socket] = this.messagesMetrics[context.user.socket].filter(
                //keep metrics one hour
                (m) => m.timeStamp > Date.now() - 60 * 60 * 1000
            );

            // most used words
            text.replace(/[^A-Za-z0-9]/g, '')
                .split(' ')
                .forEach((word) => {
                    if (!this.words[word]) {
                        this.words[word] = 0;
                    }
                    ++this.words[word];
                });
        } catch (e) {
            console.error(e);
        }
        return text;
    }
}
