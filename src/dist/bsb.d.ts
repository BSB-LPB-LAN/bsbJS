import { Command, Device } from "./interfaces";
import { Observable } from "rxjs";
export declare enum MSG_TYPE {
    /** request info telegram */
    QINF = 1,
    /** send info telegram */
    INF = 2,
    /** set parameter */
    SET = 3,
    /** acknowledge set parameter */
    ACK = 4,
    /** do not acknowledge set parameter */
    NACK = 5,
    /** query parameter */
    QUR = 6,
    /** answer query */
    ANS = 7,
    /** error */
    ERR = 8,
    /** query  reset value */
    QRV = 15,
    /** answer reset value */
    ARV = 16,
    /** query reset value failed (1 byte payload of unknown meaning) */
    QRE = 17,
    /** internal query type 1 (still undecoded) */
    IQ1 = 18,
    /** internal answer type 1 (still undecoded) */
    IA1 = 19,
    /** internal query type 2 (still undecoded) */
    IQ2 = 20,
    /** internal answer type 2 (still undecoded) */
    IA2 = 21
}
export interface RAWMessage {
    data: number[];
    src: number;
    dst: number;
    typ: MSG_TYPE;
    cmd: number[];
    crc: number[];
    payload: number[];
}
export declare class Definition {
    private config;
    private mapCmds;
    constructor(config: any);
    private findCMDs;
    findCMD(cmd: string, device: Device): Command | null;
}
export declare class BSB {
    constructor(definition: Definition, device: Device, language: string);
    Log$: Observable<any>;
    private log$;
    private definition;
    private client;
    private buffer;
    private language;
    private device;
    private getLanguage;
    private toHexString;
    private calcCRC;
    private toHHMM;
    private parseMessage;
    private parseBuffer;
    send(): void;
    connect(ip: string, port: number): void;
}