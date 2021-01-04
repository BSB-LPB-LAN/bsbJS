import { Command } from "../interfaces";
import * as Payloads from "./";
/**
 * Create a new Payloadobject for the command
 * @param data can be a payload with datatype number[] or data with string, number or null for empty
 * @param command the command
 */
export declare function from(data: number[] | number | string | null, command: Command): Payloads.DateTime | Payloads.DayMonth | Payloads.Enum | Payloads.Error | Payloads.HourMinute | Payloads.Number | Payloads.String | Payloads.Bit | Payloads.TimeProg;
