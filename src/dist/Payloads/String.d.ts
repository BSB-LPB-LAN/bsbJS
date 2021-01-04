import { Value, Command } from '../interfaces';
export declare class String implements Value<string> {
    value: string | null;
    private command;
    constructor(data: number[] | string | null | number, command: Command);
    toPayload(): never[];
    toString(): string;
}
