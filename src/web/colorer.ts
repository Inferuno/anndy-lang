import { tokenize } from "../lang/tokenizer.ts";
import type { Token } from "../lang/tokenizer.ts";

export function colorLine(line: string, into: HTMLElement): void {
    let lastEnd = 0;

    let tokens: Token[];
    try {
        tokens = tokenize(line);
    } catch {
        into.append(line);
        return;
    }

    for (let i = 0; i < tokens.length; i++) {
        const token: Token = tokens[i];
        into.append(line.slice(lastEnd, token.position - 1));

        const span = document.createElement("span");
        span.className = `tok-${token.kind}`;
        span.textContent = token.text;
        into.append(span);

        lastEnd = token.position + token.text.length - 1;
    }

    into.append(line.slice(lastEnd));
}
