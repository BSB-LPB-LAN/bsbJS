import { BSBDefinition, Command, Device } from './interfaces';
export declare class Definition {
    config: BSBDefinition;
    private mapCmds;
    private mapParams;
    constructor(config: BSBDefinition);
    private find;
    private findCMDorParam;
    findCMD(cmd: string, device: Device): Command | null;
    findParam(param: number, device: Device): Command | null;
}
