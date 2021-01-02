import { Value } from './interfaces';
export declare class ErrorValue implements Value<number> {
    value: number | null;
    constructor(data: number[] | number);
    toString(lang?: string): number;
}
