import { IPlugin } from './IPlugin';
import { IPluginContext } from './IPluginContext';
import { IPluginHelp } from './IPluginHelp';
import * as cowsay from 'cowsay';
import { sendMSGAsSystem } from '../utils';

const cows = [
    `\\|/          (__)    
     \`\\------(oo)
       ||    (__)
       ||w--||     \\|/
   \\|/`,
    `                                       /;    ;\\
                                   __  \\\\____//
                                  /{_\\_/   \`'\\____
                                  \\___   (o)  (o  }
       _____________________________/          :--'  
   ,-,'\`@@@@@@@@       @@@@@@         \\_    \`__\\
  ;:(  @@@@@@@@@        @@@             \\___(o'o)
  :: )  @@@@          @@@@@@        ,'@@(  \`===='       
  :: : @@@@@:          @@@@         \`@@@:
  :: \\  @@@@@:       @@@@@@@)    (  '@@@'
  ;; /\\      /\`,    @@@@@@@@@\\   :@@@@@)
  ::/  )    {_----------------:  :~\`,~~;
 ;;'\`; :   )                  :  / \`; ;
;;;; : :   ;                  :  ;  ; :              
\`'\`' / :  :                   :  :  : :
    )_ \\__;      ";"          :_ ;  \\_\\       \`,','
    :__\\  \\    * \`,'*         \\  \\  :  \\   *  8\`;'*  *
        \`^'     \\ :/           \`^'  \`-^-'   \\v/ :  \\/ `,
    `             /( ,,,,, )\\
            _\\,;;;;;;;,/_
         .-"; ;;;;;;;;; ;"-.
         '.__/\`_ / \\ _\`\\__.'
            | (')| |(') |
            | .--' '--. |
            |/ o     o \\|
            |           |
           / \\ _..=.._ / \\
          /:. '._____.'   \\
         ;::'    / \\      .;
         |     _|_ _|_   ::|
       .-|     '==o=='    '|-.
      /  |  . /       \\    |  \\
      |  | ::|         |   | .|
      |  (  ')         (.  )::|
      |: |   |; U U U ;|:: | \`|
      |' |   | \\ U U / |'  |  |
      ##V|   |_/\`"""\`\\_|   |V##
jgs      ##V##         ##V##`,
    `                      ,     ,
                  ___('-&&&-')__
                 '.__./     \\__.'
     _     _     _ .-'  6  6 \\
   /\` \`--'( ('--\` \`\\         |
  /        ) )      \\ \\ _   _|
 |        ( (        | (0_._0)
 |         ) )       |/ '---'
 |        ( (        |\\_
 |         ) )       |( \\,
  \\       ((\`       / )__/
   |     /:))\\     |   d
   |    /:((::\\    |
   |   |:::):::|   |
   /   \\::&&:::/   \\
   \\   /;U&::U;\\   /
    | | | u:u | | |
    | | \\     / | |
jgs | | _|   | _| |
    / \\""\`   \`""/ \\
   | __|       | __|
   \`"""\`       \`"""\``
];

/**
 * a little easter eggs plugin
 */
export class CowPlugin implements IPlugin {
    commands: Array<string> = ['cow'];

    filterText(text: string, context: IPluginContext): string {
        return text;
    }

    getHelp(cmd: string): IPluginHelp {
        return {
            description: 'MooOoOoOOoh ??',
            parameters: ['text']
        };
    }

    async handleCommand(cmd: string, args: string, context: IPluginContext): Promise<void> {
        const { socket } = context;
        if (args) {
            const message = sendMSGAsSystem(
                `\n${cowsay.say({
                    text: args
                })}`
            );
            socket.emit('msg', message);
            socket.broadcast.emit('msg', message);
        } else {
            socket.emit('msg', sendMSGAsSystem(`\n${cows[Math.floor(Math.random() * cows.length)]}`));
        }
    }
}
