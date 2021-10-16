/**
 * describe the return waited by the help plugin
 */
export interface IPluginHelp {
    /**
     * a short description for the user
     */
    description: string;
    /**
     * a list of parameters
     */
    parameters?: Array<string>;
}
