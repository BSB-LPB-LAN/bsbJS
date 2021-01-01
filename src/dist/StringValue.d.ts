import { Value, Command } from './interfaces';
export declare class StringValue implements Value<string> {
    value: string | null;
    private command;
    constructor(data: number[] | string | Date, command: Command);
    toString(): string;
}
