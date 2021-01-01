import { TranslateItem } from "./interfaces";

export class Helper {
    public static getLanguage(langRessource: TranslateItem | undefined, language: string = "KEY"): string | null {

        if (!langRessource)
            return null;

        let lookup = langRessource as any;

        if (lookup.hasOwnProperty(language)) {
            return lookup[language];
        }

        if (lookup.hasOwnProperty("EN")) {
            return lookup[language];
        }

        if (lookup.hasOwnProperty("DE")) {
            return lookup[language];
        }

        if (lookup.hasOwnProperty("KEY")) {
            return lookup[language];
        }

        return null;
    }

    public static toHexString(byteArray: number[]): string {
        return Array.from(byteArray, function (byte) {
            return ('0' + (byte & 0xFF).toString(16)).slice(-2);
        }).join('').toUpperCase();
    }
}