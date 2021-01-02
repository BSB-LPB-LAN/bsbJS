import { Value, Command } from './interfaces';
export declare class BitValue implements Value<number> {
    value: number | null;
    private enum;
    private command;
    constructor(data: number[] | Date, command: Command);
    toString(lang?: string): string;
}
