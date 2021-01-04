import { KeyItem } from './interfaces';
export interface QueryResult extends KeyItem<QueryResultEntry> {
}
export interface QueryResultEntry {
    name: string;
    error: number;
    value: string;
    desc: string;
    dataType: number;
    readonly: number;
    unit: string;
}
