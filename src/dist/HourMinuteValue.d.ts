import { Value, Command } from './interfaces';
export declare class HourMinuteValue implements Value<Date> {
    value: Date | null;
    private command;
    constructor(data: number[] | string | Date, command: Command);
    toString(): string;
}
