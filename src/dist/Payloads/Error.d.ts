import { Value } from '../interfaces';
export declare class Error implements Value<number> {
    value: number | null;
    constructor(data: number[] | number | string | null);
    toPayload(): never[];
    toString(lang?: string): string;
}
