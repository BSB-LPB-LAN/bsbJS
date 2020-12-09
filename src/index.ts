import * as net from "net";
import * as fs from "fs";

interface RAWMessage {
    data : number[];
    src: number;
    dst: number;
    typ: number;
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
    factor: string;
    precision: string;
    enable_byte: string;
}

interface Device {
    family: number;
    var: number;
}

interface ConfigItem {
    command: string;
    category: Category;
    type: Type;
    parameter: number;
    description: string;
    flag: number;
    device: Device;
}

interface CmdMap {
    [key: string]: ConfigItem[];
 } 
class Definition {

    private config: ConfigItem[];

    private mapCmds : CmdMap = {}; 

    constructor(config: any) {
        this.config = config;

        for(let item of this.config) {
            this.mapCmds[item.command].push(item);
        }
    }

    public findCMD(cmd: string): ConfigItem | null
    {
        let item = this.mapCmds[cmd];
        // TODO check for device familiy / variant
        if (item && item.length > 0)
            return item[0];
        return null;
    }

}

class BSB {

    
    constructor (definition: Definition) {
        this.definition = definition;
    }
    
    private definition: Definition;
    private client = new net.Socket();

    private buffer: number[] = [];

    private calcCRC(data:string): any
    {
        function crc16(crc16:number, item:number): number{
            
            crc16 = crc16 ^ (item << 8);
            
            for (let i=0; i < 8; i++) {
                if (crc16 & 0x8000) {
                  crc16 = (crc16 << 1) ^ 0x1021;
                } else {
                  crc16 <<= 1;
                }
            }
            return crc16 & 0xFFFF; 
        }
    
        let crc: number  = 0;
    
        for (let i = 0; i < data.length; i++) {
            crc = crc16(crc, data.charCodeAt(i));
        }
        
        return crc;
    }

    private parseMessage(msg: RAWMessage)
    {

    }


    private parseBuffer() {
        let pos: number = 0;

        while (pos < this.buffer.length)
        {
            // BSB
            if ((pos < this.buffer.length-4) && (this.buffer[pos]== 0xDC))
            {
                let len = this.buffer[pos+3];

                if (pos < this.buffer.length-len)
                {
                    let newmessage = this.buffer.slice(pos,pos+len);
                    let dst = this.buffer[1];
                    
                    //let testcrc = this.calcCRC(newmessage.slice(0,newmessage.length-2));
                    
                    let msg = {
                        data : newmessage,
                        src: newmessage[1] & 0x7F,
                        dst: newmessage[2],
                        typ: newmessage[4],
                        cmd: newmessage.slice(5,9),
                        crc: newmessage.slice(newmessage.length-2),
                       //testcrc: testcrc,
                        payload: newmessage.slice(9,newmessage.length-2)
                    };
                    console.log(msg);
                    this.parseMessage(msg);
                    
                    pos = -1;
                    
                    // todo if pos <> 0, send message with
                    // unprocessed data
                    
                    this.buffer = this.buffer.slice(pos+len);
                }
            }
            pos++;
        }
    }

    public connect(ip: string, port: number)
    {

        console.log('start connect');
        this.client = new net.Socket();
        this.client.connect(port,ip, ()=> {
            console.log('connected');
        });

        this.client.on('data', (data)=> {
            for(let i = 0; i < data.length; i++)
            {
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
bsb.connect('192.168.203.179',1000);


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