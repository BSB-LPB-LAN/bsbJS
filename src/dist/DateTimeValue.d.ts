import { Value, Command } from './interfaces';
export declare class DateTimeValue implements Value<Date> {
    value: Date | null;
    private command;
    constructor(data: number[] | string | Date, command: Command);
    toString(): string;
}
