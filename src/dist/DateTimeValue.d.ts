import { Value } from './interfaces';
export declare class DateTimeValue implements Value<Date> {
    value: Date | null;
    private constructor();
    static from(data: number[] | string | Date): DateTimeValue;
    toString: () => string;
}
