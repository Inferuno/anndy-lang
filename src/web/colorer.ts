import { tokenize } from "../lang/tokenizer.ts";
import type { Token } from "../lang/tokenizer.ts";
import type { Run } from "../lang/run.ts";

export function colorLine(line: string, into: HTMLElement, error?: { start: number; end: number; output: string }): void {
    let lastEnd = 0;

    let tokens: Token[];
    try {
        tokens = tokenize(line);
    } catch {
        into.append(line);
        return;
    }

    const row = document.createElement("span");
    row.className = error ? "line line-error" : "line";

    for (let i = 0; i < tokens.length; i++) {
        const token: Token = tokens[i];
        row.append(line.slice(lastEnd, token.position - 1));

        const span = document.createElement("span");
        span.className = `tok-${token.kind}`;
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
