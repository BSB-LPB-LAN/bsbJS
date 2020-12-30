import { Value } from './interfaces';
export declare class DayMonthValue implements Value<Date> {
    value: Date | null;
    private constructor();
    static from(data: number[] | string | Date): DayMonthValue;
    toString(): string;
}
