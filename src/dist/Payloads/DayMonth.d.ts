import { Value, Command } from '../interfaces';
export declare class DayMonth implements Value<Date> {
    value: Date | null;
    private command;
    constructor(data: number[] | string | Date | null, command: Command);
    toPayload(): never[];
    toString(): string;
}
