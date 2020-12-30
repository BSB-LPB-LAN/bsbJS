import { Value } from './interfaces'

export class DateTimeValue implements Value<Date> {

    public value: Date | null = null

    private constructor() { }

    public static from(data: number[] | string | Date): DateTimeValue {

        let result = new DateTimeValue()
        if (data instanceof Array) {
            let payload = data;
           
            result.value = new Date(
                payload[1]+1900, payload[2]-1,payload[3], // Date
                payload[5], payload[6], payload[7] )    // Time

        } else  if (data instanceof Date)
        {
            result.value = data
        } else if (typeof(data) == 'string')
        {
            result.value = new Date(data)
        }

        return result
    }

    public toString () {
       
        const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        return this.value?.toLocaleDateString('de-DE', options).replace(',','') ?? '---'
    }
}