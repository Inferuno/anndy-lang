import { tokenize } from "../lang/tokenizer.ts";
import type { Token, SymbolKind } from "../lang/tokenizer.ts";
import { LangError } from "../lang/error.ts";

const brackets: Token["kind"][] = ["rparen", "lparen", "comma", "rbracket", "lbracket"];
const ops: Token["kind"][] = ["plus", "minus", "caret", "slash", "asterisk"];

function tokenType(tokenKind: Token["kind"]): string {
    if (brackets.includes(tokenKind)) return "bracket";
    if (ops.includes(tokenKind)) return "op";
    return tokenKind;
}

export function colorLine(line: string, into: HTMLElement, error?: { start: number; end: number; output: string }): void {
    let lastEnd = 0;

    let tokens: Token[];

    const row = document.createElement("span");
    row.className = error ? "line line-error" : "line";

    try {
        tokens = tokenize(line);
    } catch {
        line.split(" ").forEach((word) => {
            try {
                const tokens = tokenize(word);

                for (let i = 0; i < tokens.length; i++) {
                    const token = tokens[i];

                    const span = document.createElement("span");
                    span.className = `tok-${tokenType(token.kind)}`;
                    span.textContent = token.text;
                    row.append(span);
                }
                row.append(" ");
            } catch (err: any) {
                if (err instanceof LangError) {
                    const span = document.createElement("span");
                    span.className = `tok-error squiggle`;
                    span.textContent = word;
                    row.append(span);
                    row.append(" ");
                } else {
                    throw err;
                }
            }
        });

        if (error) {
            const span = document.createElement("span");
            span.className = "lens";
            span.textContent = error.output;
            row.append(span);
        }

        into.append(row);

        return;
    }

    for (let i = 0; i < tokens.length; i++) {
        const token: Token = tokens[i];
        row.append(line.slice(lastEnd, token.position - 1));

        const span = document.createElement("span");
        span.className = `tok-${tokenType(token.kind)}`;
        span.textContent = token.text;
        if (error && token.position >= error.start && token.position <= error.end) span.classList.add("squiggle");
        row.append(span);

        lastEnd = token.position + token.text.length - 1;
    }

    if (error) {
        const span = document.createElement("span");
        span.className = "lens";
        span.textContent = error.output;
        row.append(span);
    }

    into.append(row);

    into.append(line.slice(lastEnd));
}
