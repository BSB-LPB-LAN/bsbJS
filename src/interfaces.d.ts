export interface BSBDefinition {
    version:     string;
    compiletime: string;
    categories:    KeyItem<Category>;
}

interface KeyItem<T> {
    [key: string]: T
} 

type LanguageKeys = "KEY" | "CS" | "DE";

type TranslateItem = {
    [key in LanguageKeys]: string | undefined;
}; 

export interface Category {
    name:     TranslateItem;
    min:      number;
    max:      number;
    commands: Command[];
}

export interface Command {
    parameter:   number;
    command:     string;
    type:        Type;
    description: TranslateItem;
    enum:        KeyItem<TranslateItem>;
    flags:       string[];
    device:      Device[];
}

export interface Device {
    family: number;
    var:    number;
}

export interface Type {
    name:           string;
    unit:           TranslateItem;
    datatype:       string;
    datatype_id:    number;
    factor:         number;
    payload_length: number;
    precision:      number;
    enable_byte:    number;
}
