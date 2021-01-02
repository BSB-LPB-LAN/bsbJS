import { Value, Command } from './interfaces'

export class DateTimeValue implements Value<Date> {

    public value: Date | null = null
    private command : Command

    constructor (data: number[] | string | Date, command: Command ) {
        this.command = command;
        if (data instanceof Array) {
            let payload = data;
           
            this.value = new Date(
                payload[1]+1900, payload[2]-1,payload[3], // Date
                payload[5], payload[6], payload[7] )    // Time

        } else  if (data instanceof Date)
        {
            this.value = data
        } else if (typeof(data) == 'string')
        {
            this.value = new Date(data)
        }
    }

    public toString () {
        const options = { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return this.value?.toLocaleDateString('de-DE', options).replace(',','') ?? '---'
    }
}