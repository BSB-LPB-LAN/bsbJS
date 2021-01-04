import { Value, Command } from '../interfaces';
export declare class Enum implements Value<number> {
    value: number | null;
    private enum;
    private command;
    constructor(data: number[] | string | number | null, command: Command);
    toPayload(): never[];
    toString(lang?: string): string;
}
