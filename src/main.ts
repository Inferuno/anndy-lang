import { tokenize } from "./lang/tokenizer.ts";
import { evaluate } from "./lang/evaluator.ts";
import { parse } from "./lang/parser.ts";
import { LangError } from "./lang/error.ts";
import { variables } from "./lang/executor.ts";
import { execute } from "./lang/executor.ts";

const code = `
set x to [5]
set y to [3]
change y by *[15]
set z to [x * (y - 2)]
print [z]
`;


const codeLines = code.split("\n").map(line => line.trim())

for (let i = 0; i < codeLines.length; i++) {
    const line = codeLines[i];
    try {
        const tokens = tokenize(line);
        if (tokens.length === 0) continue;

        const wasExecuted = execute(tokens);

        if (wasExecuted) continue;
        throw new LangError(`Unknown command.`, tokens[1].position, tokens[tokens.length - 1].position)

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
