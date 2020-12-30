import { Value } from './interfaces'

export class DayMonthValue implements Value<Date> {

    public value: Date | null = null

    private constructor() { }

    public static from(data: number[] | string | Date): DayMonthValue {

        let result = new DayMonthValue()
        if (data instanceof Array) {
            let payload = data;
                if ((payload[0] & 0x01) != 0x01) {
                    result.value = new Date(0, payload[2]-1, payload[3]);
                }
                else
                    result.value = null;
        } else  if (data instanceof Date)
        {
            result.value = data
        } else if (typeof(data) == 'string')
        {
            result.value = new Date(data)
        }

        return result
    }

    public toString() {

        const options = { year: undefined, month: 'numeric', day: 'numeric'};

        return this.value?.toLocaleString('de-DE', options) ?? '---'
    }
}