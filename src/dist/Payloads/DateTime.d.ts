import { Value, Command } from '../interfaces';
export declare class DateTime implements Value<Date> {
    value: Date | null;
    private command;
    constructor(data: number[] | string | Date | number | null, command: Command);
    toPayload(): never[];
    toString(): string;
}
