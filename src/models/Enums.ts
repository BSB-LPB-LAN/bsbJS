
//error
//0 - ok, 7 - parameter not supported, 1-255 - LPB/BSB bus errors, 256 - decoding error, 257 - unknown command, 258 - not found, 259 - no enum str, 260 - unknown type, 261 - query failed

// datatype
//0 = Zahl, 1 = ENUM, 2 = Bit-Wert (Dezimalwert gefolgt von Bitmaske gefolgt von ausgewählter Option), 3 = Wochentag, 4 = Stunde/Minute, 5 = Datum/Uhrzeit, 6 = Tag/Monat, 7 = String, 8 = PPS-Uhrzeit (Wochentag, Stunde:Minute)


//readonly
//0 = read/write, 1 = read only parameter

export const TrueFalseDescription = '0 ... false<br>1 ... true'
export enum TrueFalse {
    true = 1,
    false = 0
}

export const SetStatusDescription = '0 ... error<br>1 ... ok<br>2 ... parameter is readonly'
export enum SetStatus {
    Error = 0,
    OK = 1,
    ReadOnly = 2
}

export const DataTypeDescription =
    `0 ... number<br>
     1 ... enum<br>
     2 ... bit value (decimal value and bitmask of selected options)<br>
     3 ... weekday<br>
     4 ... hour:minute<br>
     5 ... date time<br>
     6 ... day:month<br>
     7 ... string<br>
     8 ... PPS Time (weekday, hour:minute)
     `

export enum DataType {
    Number = 0,
    Enum = 1,
    BitValue = 2,
    Weekday = 3,
    HourMinute = 4,
    DateTime = 5,
    DayMonth = 6,
    Text = 7,
    PPSTime = 8
}

export enum ParameterSetRequestType {
    /** INF Message */
    INF = 0,
    /** SET Message */
    SET = 1
}