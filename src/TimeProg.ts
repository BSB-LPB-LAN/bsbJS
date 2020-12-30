import { Value } from './interfaces'

export class TimeProgEntry {
    public start?: Date
    public end?: Date

    public toString ()  {
        return (this.start ?? '--:--') + ' - ' + (this.end ?? '--:--')
    }
}

export class TimeProgValues implements Value<TimeProgEntry[]> {

    public value: TimeProgEntry[] | null = null

    private constructor() { }

    public static from(data: number[] | string | Date): TimeProgValues {

        let result = new TimeProgValues()
        result.value = []

        if (data instanceof Array) {
            let values = [];

            for (let i = 0; i < 3; i++) {
                // check if block is enabled
                if ((data.slice(4 * i)[0] & 0x80) != 0x80) {

                   // return byteArray[0].toString().padStart(2, '0') + ':' + byteArray[1].toString().padStart(2, '0');
    
                    let entry = new TimeProgEntry()
                    entry.start = this.toHHMM(data.slice(4 * i + 0, 4 * i + 2))
                    entry.end = this.toHHMM(data.slice(4 * i + 2, 4 * i + 4))

                    result.value.push(entry)
                }
               
            }

            // let data = data;
            //     if ((data[0] & 0x01) != 0x01) {
            //         result.value = new Date(0, data[2]-1, data[3]);
            //     }
            //     else
            //         result.value = null;
        } else if (typeof(data) == 'string')
        {
            // ToDo Parse String
            //result.value = new Date(data)
        }

        return result
    }

    public toString() {

        // values.toString = function () {
        //     let result = ''
        //     let val = this;

        //     for (let i = 0; i < 3; i++) {
        //         if (i > 0)
        //             result += ' '
        //         result += (i + 1) + '. '
        //         if (i < val.length) {
        //             result += val[i].toString()
        //         } else {
        //             result += '--:-- - --:--'
        //         }
        //     }

        //     return result
        // }

        return this.value?.toString() ?? '---'
    }
}