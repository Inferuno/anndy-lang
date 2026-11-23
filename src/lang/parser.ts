import type { Tree } from "./evaluator.ts";
import type { Token, SymbolKind } from "./tokenizer.ts";
import { LangError } from "./error.ts";

const precedence: Partial<Record<SymbolKind, number>> = {
    'plus': 1,
    'minus': 1,
    'asterisk': 2,
    'slash': 2,
    'caret': 3
};

export function parse(tokens: Token[]): Tree {
    if (tokens.length <= 0) throw new Error("Expected a number.");
    if (tokens.length === 1) {
        const token = tokens[0];

        if (token.kind === "name") return { name: token.text, position: token.position };
        if (token.kind === "keyword") throw new LangError(`"${token.text}" is a keyword, not a variable.`, token.position, token.position + token.text.length - 1)
        if (token.kind !== "number") throw new LangError(`Unknown expression "${token.text}".`, token.position, token.position + token.text.length - 1);
        return token.value;
    }

    let depth = 0;
    let cutIndex = -1;
    let cutPrecedence = Infinity;

    for (let i = 0; i < tokens.length; i++) {
        const tokenKind = tokens[i].kind;

        const isNegativeSign: boolean = tokenKind === "minus" && (i === 0 || ((tokens[i - 1].kind !== "number" && tokens[i - 1].kind !== "name") && tokens[i - 1].kind !== "rparen"));

        if (isNegativeSign) continue;

        if (tokenKind === "number" || tokenKind === "name" || tokenKind === "keyword") continue;

        if (tokenKind === "lparen") depth += 1;
        if (tokenKind === "rparen") depth -= 1;

        if (depth === -1) throw new LangError("Expected an opening paren.", tokens[i].position, tokens[i].position);

        if (depth === 0) {
            if (precedence[tokenKind] === undefined) continue;

            if (precedence[tokenKind] < cutPrecedence || (precedence[tokenKind] === cutPrecedence && tokenKind !== "caret")) {
                cutIndex = i;
                cutPrecedence = precedence[tokenKind];
            }
        }
    }
    if (depth >= 1) throw new LangError("Expected a closing paren.", tokens[0].position, tokens[tokens.length - 1].position + tokens[tokens.length - 1].text.length - 1);


    if (cutIndex === -1 && tokens[0].kind === "minus") {
        return { op: "minus", left: 0, right: parse(tokens.slice(1)) };
    }

    if (cutIndex === -1) {
        if (tokens[0].kind === "lparen" && tokens[tokens.length - 1].kind === "rparen") {
            if (tokens.length === 2) throw new LangError(`Expected a number inside "()".`, tokens[0].position, tokens[1].position);
            return parse(tokens.slice(1, tokens.length - 1));
        } else {
            throw new LangError(`Expected an operator.`, tokens[1].position, tokens[1].position + tokens[1].text.length - 1);
        }
    }

    const before = tokens.slice(0, cutIndex);
    const after = tokens.slice(cutIndex + 1);

    if (before.length === 0) throw new LangError(`Expected a number before "${tokens[cutIndex].text}".`, tokens[cutIndex].position, tokens[cutIndex].position);
    if (after.length === 0) throw new LangError(`Expected a number after "${tokens[cutIndex].text}".`, tokens[cutIndex].position, tokens[cutIndex].position);

    return { op: tokens[cutIndex].kind, left: parse(before), right: parse(after) };
}
