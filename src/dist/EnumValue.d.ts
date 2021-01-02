import { Value, Command } from './interfaces';
export declare class EnumValue implements Value<number> {
    value: number | null;
    private enum;
    private command;
    constructor(data: number[] | string | Date, command: Command);
    toString(lang?: string): string;
}
