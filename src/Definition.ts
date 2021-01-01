import { BSBDefinition, CmdMap, Command, Device } from './interfaces'

export class Definition {

    private config: BSBDefinition;

    private mapCmds: CmdMap = {};
    private mapParams: CmdMap = {};

    constructor(config: any) {
        this.config = config;

        for (let catKEY in this.config.categories) {
            let cat = this.config.categories[catKEY];
            for (let item of cat.commands) {
                let map = this.mapCmds[item.command];
                if (!this.mapCmds[item.command])
                    this.mapCmds[item.command] = [];

                this.mapCmds[item.command].push(item);

                if (!this.mapParams[item.parameter])
                    this.mapParams[item.parameter] = [];

                this.mapParams[item.parameter].push(item);
            }
        }
    }

    private find(place: 'Cmd' | 'Param', key: string, dev_family: number, dev_variant: number): Command | null {
        let item: Command[]

        if (place == 'Cmd') {
            item = this.mapCmds[key]
        }
        else {
            item = this.mapParams[key]
        }
        if (item)
            for (let entry of item) {
                for (let device of entry.device) {
                    if ((device.family == dev_family)
                        && (device.var == dev_variant))
                        return entry;
                }
            }
        return null;
    }

    private findCMDorParam(place: 'Cmd' | 'Param', key: string, device: Device): Command | null {

        let result: Command | null = null;

        // search for exact match of family and variant
        result = this.find(place, key, device.family, device.var);
        if (result) return result;

        // search for exact match of family
        result = this.find(place, key, device.family, 255);
        if (result) return result;

        // search for exact 255,255
        result = this.find(place, key, 255, 255);
        if (result) return result;

        return null;
    }

    public findCMD(cmd: string, device: Device): Command | null {
        return this.findCMDorParam('Cmd', cmd, device)
    }

    public findParam(param: number, device: Device): Command | null {
        return this.findCMDorParam('Param', param.toString(), device)
    }

}