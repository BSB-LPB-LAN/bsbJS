import { Value, Command } from '../interfaces';
export declare class TimeProgEntry {
    start?: Date;
    end?: Date;
    constructor(data?: number[] | string);
    toString(): string;
    static empty: TimeProgEntry;
}
export declare class TimeProg implements Value<TimeProgEntry[]> {
    value: TimeProgEntry[] | null;
    private command;
    constructor(data: number[] | string | null, command: Command);
    toPayload(): never[];
    toString(): string;
}
