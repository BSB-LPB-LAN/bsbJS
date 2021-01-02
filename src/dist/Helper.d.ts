import { TranslateItem } from "./interfaces";
export declare class Helper {
    static getLanguage(langRessource: TranslateItem | null | undefined, language?: string): string | null;
    static toHexString(byteArray: number[]): string;
}
