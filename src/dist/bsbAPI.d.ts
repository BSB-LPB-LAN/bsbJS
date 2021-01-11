import { KeyItem } from './interfaces';
import express from 'express';
import { BSB } from './bsb';
import { Definition } from './Definition';
export interface QueryResult extends KeyItem<QueryResultEntry> {
}
export interface EnumDescEntry {
    enumValue: number;
    desc: string;
}
declare type EnumDescEntries = EnumDescEntry[];
export interface ReadConfigEntry {
    id: string;
    type: string;
    format: string;
    category: string;
    name: string;
    value: string;
    possibleValues: EnumDescEntries;
}
export interface ReadConfig extends KeyItem<ReadConfigEntry> {
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
export {};
