import { LangError } from "./error.ts";
import type { Token } from "./tokenizer.ts";
import { evaluate } from "./evaluator.ts";
import { parse } from "./parser.ts";

export const variables: Partial<Record<string, number>> = {}

export function execute(tokens: Token[]): boolean {
    if (tokens[0].text.toLowerCase() === "set") {
        const expression = tokens.slice(4, tokens.length - 1);
        const value = evaluate(parse(expression), variables);

        variables[tokens[1].text] = value;
        return true;
    }
    return false;
}
