import * as net from "net";
import * as fs from "fs";


// /* telegram addresses */
// #define ADDR_HEIZ  0x00
// #define ADDR_EM1   0x03
// #define ADDR_EM2   0x04
// #define ADDR_RGT1  0x06
// #define ADDR_RGT2  0x07
// #define ADDR_CNTR  0x08
// #define ADDR_DISP  0x0A
// #define ADDR_SRVC  0x0B
// #define ADDR_OZW   0x31
// #define ADDR_FE    0x32
// #define ADDR_RC    0x36
// #define ADDR_LAN   0x42
// #define ADDR_ALL   0x7F

enum MSG_TYPE {
    /** request info telegram */
    QINF = 0x01,
    /** send info telegram */
    INF = 0x02,
    /** set parameter */
    SET = 0x03,
    /** acknowledge set parameter */
    ACK = 0x04,
    /** do not acknowledge set parameter */
    NACK = 0x05,
    /** query parameter */
    QUR = 0x06,
    /** answer query */
    ANS = 0x07,
    /** error */
    ERR = 0x08,
    /** query  reset value */
    QRV = 0x0F,
    /** answer reset value */
    ARV = 0x10,
    /** query reset value failed (1 byte payload of unknown meaning) */
    QRE = 0x11,
    /** internal query type 1 (still undecoded) */
    IQ1 = 0x12,
    /** internal answer type 1 (still undecoded) */
    IA1 = 0x13,
    /** internal query type 2 (still undecoded) */
    IQ2 = 0x14,
    /** internal answer type 2 (still undecoded) */
    IA2 = 0x15,
}


//#region Interfaces
interface RAWMessage {
    data: number[];
    src: number;
    dst: number;
    typ: MSG_TYPE;
    cmd: number[];
    crc: number[];
    payload: number[];
}
interface Category {
    name: string;
    min: number;
    max: number;
}

interface Type {
    name: string;
    unit: string;
    datatype: string;
    factor: number;
    precision: number;
    enable_byte: number;
    payload_length: number;
}

interface Device {
    family: number;
    var: number;
}

interface ConfigItemEnum {
    [key: string]: string
}

interface ConfigItem {
    command: string;
    category: Category;
    type: Type;
    parameter: number;
    description: string;
    enum: ConfigItemEnum;
    flag: number;
    device: Device;
}

interface CmdMap {
    [key: string]: ConfigItem[];
}

//#endregion
class Definition {

    private config: ConfigItem[];

    private mapCmds: CmdMap = {};

    constructor(config: any) {
        this.config = config;

        for (let item of this.config) {
            let map = this.mapCmds[item.command];
            if (!this.mapCmds[item.command])
                this.mapCmds[item.command] = [];

            this.mapCmds[item.command].push(item);
        }
    }

    public findCMD(cmd: string): ConfigItem | null {
        let item = this.mapCmds[cmd];
        // TODO check for device familiy / variant
        if (item && item.length > 0)
            return item[0];
        return null;
    }

}

class BSB {


    constructor(definition: Definition) {
        this.definition = definition;
    }

    private definition: Definition;
    private client = new net.Socket();

    private buffer: number[] = [];

    private toHexString(byteArray: number[]): string {
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('').toUpperCase();
    }


    private calcCRC(data: string): any {
        function crc16(crc16: number, item: number): number {

            crc16 = crc16 ^ (item << 8);

            for (let i = 0; i < 8; i++) {
                if (crc16 & 0x8000) {
                    crc16 = (crc16 << 1) ^ 0x1021;
                } else {
                    crc16 <<= 1;
                }
            }
            return crc16 & 0xFFFF;
        }

        let crc: number = 0;

        for (let i = 0; i < data.length; i++) {
            crc = crc16(crc, data.charCodeAt(i));
        }

        return crc;
    }

    private parseMessage(msg: RAWMessage) {

        if (msg.typ == MSG_TYPE.QUR) {
            let swap = msg.cmd[0];
            msg.cmd[0] = msg.cmd[1];
            msg.cmd[1] = swap;
        }


        let cmd = '0x' + this.toHexString(msg.cmd);
        let command = this.definition.findCMD(cmd);

        let value = '';

        if (msg.typ == MSG_TYPE.ANS)
        {
            if (command?.type.datatype == 'ENUM'){
                
            }

            if (command?.type.datatype == 'VALS' || command?.type.datatype == 'ENUM')
            {
                let len = command.type.payload_length & 31;
                let rawValue = 0;

                let payload = msg.payload;
                if (command.type.enable_byte > 0)
                    payload = payload.slice(1);
                // handle enable byte !!!
                if (command.parameter == 8327)
                    console.log(payload);
                        
                if (command?.type.datatype == 'VALS') {
                    switch(len) {
                        case 1:
                            rawValue = Buffer.from(payload).readInt8();
                            break;
                        case 2:
                            rawValue = Buffer.from(payload).readInt16BE();
                            break;
                        case 4:
                            rawValue = Buffer.from(payload).readInt32BE();
                            break;
                    }
                    value = (rawValue / command.type.factor).toFixed(command.type.precision) + command.type.unit;
                }

                if (command?.type.datatype == 'ENUM')
                {
                    if (payload.length == 1)
                        payload.unshift(0);

                    if (command.type.name == 'ONOFF' || command.type.name == 'YESNO' || command.type.name == 'CLOSEDOPEN' || 'VOLTAGEONOFF')
                    {
                        payload[1] = payload[1] & 0x01;
                    }
                    
                    let enumKey = '0x' + this.toHexString(payload);
                    value = command.enum[enumKey];
                    if (!value)
                        console.log('ENUM   '+payload+' - '+ enumKey +' ',command.enum);
                }
                //console.log('***' + len + ' - '+rawValue+ ' - '+value +'       - '+this.toHexString(payload));
            }
        }

        console.log(MSG_TYPE[msg.typ] + ' ' + cmd + ' '+ command?.description+' ('+command?.parameter+') = '+value);

    }


    private parseBuffer() {
        let pos: number = 0;

        while (pos < this.buffer.length) {
            // BSB
            if ((pos < this.buffer.length - 4) && (this.buffer[pos] == 0xDC)) {
                let len = this.buffer[pos + 3];

                if (pos < this.buffer.length - len+1) {
                    let newmessage = this.buffer.slice(pos, pos + len);
                    let dst = this.buffer[1];

                    //let testcrc = this.calcCRC(newmessage.slice(0,newmessage.length-2));

                    let msg = {
                        data: newmessage,
                        src: newmessage[1] & 0x7F,
                        dst: newmessage[2],
                        typ: newmessage[4],
                        cmd: newmessage.slice(5, 9),
                        crc: newmessage.slice(newmessage.length - 2),
                        //testcrc: testcrc,
                        payload: newmessage.slice(9, newmessage.length - 2)
                    };
                    //  console.log(msg);
                    this.parseMessage(msg);

                    // todo if pos <> 0, send message with
                    // unprocessed data
                   
                    this.buffer = this.buffer.slice(pos + len);

                    pos = -1;
                }
            }
            pos++;
        }
    }

    public connect(ip: string, port: number) {

        console.log('start connect');
        this.client = new net.Socket();
        this.client.connect(port, ip, () => {
            console.log('connected');
        });

        this.client.on('data', (data) => {
            for (let i = 0; i < data.length; i++) {
                this.buffer.push(~data[i] & 0xFF);
            }
            this.parseBuffer();
        });
    }

}

let rawdata = fs.readFileSync('../../BSB_lan_def2JSON/output.json');
let config = JSON.parse(rawdata as any);
let definition = new Definition(config);

let bsb = new BSB(definition);
bsb.connect('192.168.203.179', 1000);


// {
//     "6225": {
//       "name": "Gerätefamilie",
//       "error": 0,
//       "value": "163",
//       "desc": "",
//       "dataType": 0,
//       "readonly": 0,
//       "unit": ""
//     }
//   }

// {
//     "6226": {
//       "name": "Gerätevariante",
//       "error": 0,
//       "value": "5",
//       "desc": "",
//       "dataType": 0,
//       "readonly": 0,
//       "unit": ""
//     }
//   }