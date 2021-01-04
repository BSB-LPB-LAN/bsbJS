import { Value, Command } from '../interfaces';
export declare class Bit implements Value<number> {
    value: number | null;
    private enum;
    private command;
    constructor(data: number[] | number | string | null, command: Command);
    toPayload(): never[];
    toString(lang?: string): string;
}
