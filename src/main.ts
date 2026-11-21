import { tokenize } from "./tokenizer.ts";
import { evaluate } from "./evaluator.ts";
import { parse } from "./parser.ts";
import { LangError } from "./error.ts";

const code = `
5 + u
`;


const codeLines: string[] = code.split("\n").map(line => line.trimEnd());

const variables: Partial<Record<string, number>> = {
    'x': 15,
    'total': 5
}
for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i];
    try {
        const tokens = tokenize(line);
        if (tokens.length === 0) continue;

        const tree = parse(tokens);
        const answer = evaluate(tree, variables);
        console.log(answer);
    } catch (error) {
        if (error instanceof LangError) {
            const charMessage = error.end === error.position ? `character ${error.position}` : `characters ${error.position}-${error.end}`
            console.log(`At line ${i + 1}, ${charMessage}: "${error.message}"`);
        } else {
            throw error;
        }
    }
}

export { variables };