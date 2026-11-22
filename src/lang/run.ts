import { tokenize } from "./tokenizer.ts";
import { execute } from "./executor.ts";
import { LangError } from "./error.ts";

export type Run = { kind: "print"; output: number | string } | { kind: "error"; output: string; start: number; end: number; line: number };

export function run(code: string): Run[] {
    const outputs: Run[] = []

    const codeLines = code.split("\n").map(line => line.trim())

    for (let i = 0; i < codeLines.length; i++) {
        const line = codeLines[i];
        try {
            const tokens = tokenize(line);
            if (tokens.length === 0) continue;

            const wasExecuted = execute(tokens, outputs);

            if (wasExecuted) continue;

            throw new LangError("Unknown command.", tokens[0].position, tokens[tokens.length - 1].position);
        } catch (error) {
            if (error instanceof LangError) {
                outputs.push({ kind: "error", output: error.message, start: error.position, end: error.end, line: i + 1 });
            } else {
                throw error;
            }
        }
    }

    return outputs;
}
