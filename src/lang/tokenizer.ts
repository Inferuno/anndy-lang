import { LangError } from "./error.ts";

type SymbolKind = "plus" | "minus" | "asterisk" | "slash" | "lparen" | "rparen" | "caret" | "lbracket" | "rbracket" | "comma";
type Token = { kind: "number"; value: number; position: number; text: string } | { kind: SymbolKind; position: number; text: string } | { kind: "name"; position: number; text: string } | { kind: "keyword"; position: number; text: string } | { kind: "string"; position: number; value: string; text: string };

export const reservedNames: string[] = [
    "set",
    "print",
    "to",
    "change",
    "by",
    "if",
    "else",
    "function"
]

export const symbols: Partial<Record<string, SymbolKind>> = {
    '+': "plus",
    '-': "minus",
    '*': "asterisk",
    '/': "slash",
    '(': "lparen",
    ')': "rparen",
    '^': "caret",
    '[': "lbracket",
    ']': "rbracket",
    ',': "comma"
};

export type { Token, SymbolKind };

/**
The tokenize function turns a text string (of arithmetic) into tokens.

Input: One line of text (math).
Output: A list of tokens representing the arithmetic.

Called by: main.ts (once per line).

Errors:
- If you give it just a "." it will error with "Error: Unknown number "." at position 1."
- If you give it a number like "5.2.3" it will error with "Error: Unknown number "5.2." at position 4."
- If give it a number like "5x" it will error with "Error: Unknown character "x" at position 2."
Caveats:
- Passing multiple lines into tokenize will always throw an error. For example:
` 5+
2`
will just give an error "Unknown character "
" at position 3."
*/

export function tokenize(text: string): Token[] {
    const tokens: Token[] = [];

    let i = 0;

    while (i < text.length) {
        const char = text[i];

        if (char === " " || char === "\t") {
            i++;
            continue;
        }

        if (symbols[char]) {
            tokens.push({ kind: symbols[char], position: i + 1, text: char });
            i++;
            continue;
        }

        if (char === "\"") {
            const start: number = i;
            i++;

            while (i < text.length && text[i] !== '"') {
                i++;
            }
            if (text[i] !== '"') throw new LangError(`Unclosed string.`, start + 1, i);
            tokens.push({ kind: "string", position: start + 1, value: text.slice(start + 1, i), text: text.slice(start, i + 1) });
            i++;
            continue;
        }


        if (!/[a-z0-9.]/i.test(char)) {
            throw new LangError(`Unknown character "${char}".`, i + 1, i + 1);
        }

        const start: number = i;
        let seenDot: boolean = false;
        while (i < text.length && /[a-z0-9.]/i.test(text[i])) {
            if (text[i] === "." && !seenDot) seenDot = true;
            else if (text[i] === ".") {
                throw new LangError(`Unknown number "${text.slice(start, i + 1)}".`, i + 1, i + 1);
            }
            i++;
        }

        const word: string = text.slice(start, i);
        if (/[a-z]/i.test(word)) {
            if (seenDot) {
                throw new LangError("Variables cannot contain a period.", start + 1, i);
            }


            if (word.toLowerCase() === "nan" || word.toLowerCase() == "infinity") {
                tokens.push({ kind: "number", value: word.toLowerCase() === "nan" ? NaN : Infinity, position: start + 1, text: word });
                continue;
            }

            if (reservedNames.includes(word.toLowerCase())) {
                tokens.push({ kind: "keyword", position: start + 1, text: word });
                continue;
            }

            tokens.push({ kind: "name", position: start + 1, text: word });
            continue;
        }
        if (word === ".") throw new LangError(`Unknown number "${word}".`, start + 1, start + 1 + word.length - 1);
        tokens.push({ kind: "number", value: Number(word), position: start + 1, text: word });

    }

    return tokens;
}
