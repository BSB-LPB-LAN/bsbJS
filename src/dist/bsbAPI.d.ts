import { KeyItem } from './interfaces';
import express from 'express';
import { BSB } from './bsb';
import { Definition } from './Definition';
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
export declare function add_v0_API(app: express.Express, bsb: BSB, definition: Definition, language: string): void;
