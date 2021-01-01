import { Command, Device } from './interfaces';
export declare class Definition {
    private config;
    private mapCmds;
    private mapParams;
    constructor(config: any);
    private find;
    private findCMDorParam;
    findCMD(cmd: string, device: Device): Command | null;
    findParam(param: number, device: Device): Command | null;
}
