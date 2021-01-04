import { Value, Command } from '../interfaces';
export declare class Number implements Value<number> {
    value: number | null;
    private command;
    constructor(data: number[] | string | number | null, command: Command);
    toPayload(): number[];
    toString(): string;
}
