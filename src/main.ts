import { tokenize } from "./tokenizer.ts";
import { evaluate } from "./evaluator.ts";
import { parse } from "./parser.ts";
import { LangError } from "./error.ts";
import { variables } from "./executor.ts";
import { execute } from "./executor.ts";

const code = `
set x to [5]
x + 5
set y to [3]
change y by *[12]
x * (y - 2)
`;


const codeLines = code.split("\n").map(line => line.trim())

for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i];
    try {
        const tokens = tokenize(line);
        if (tokens.length === 0) continue;

        const wasExecuted = execute(tokens);

        if (wasExecuted) continue;

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
