import { Value, Command } from './interfaces';
export declare class NumberValue implements Value<number> {
    value: number | null;
    private command;
    constructor(data: number[] | string | Date, command: Command);
    toString(): string;
}
