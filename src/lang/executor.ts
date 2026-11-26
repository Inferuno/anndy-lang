import { LangError } from "./error.ts";
import type { Token } from "./tokenizer.ts";
import { evaluate, mathOptions } from "./evaluator.ts";
import { parse } from "./parser.ts";
import type { Run } from "./run.ts";

export function execute(tokens: Token[], outputs: Run[], variables: Partial<Record<string, number>>): boolean {
    function getToken(n: number) {
        return tokens[n] ?? tokens[tokens.length - 1]
    }


    if (tokens[0]?.text.toLowerCase() === "set") {
        const expression = tokens.slice(4, tokens.length - 1);

        // set <name> to [<expression>]

        if (getToken(1).kind !== "name") throw new LangError(`Expected a variable name.`, getToken(1)?.position, getToken(1)?.position + getToken(1)?.text.length - 1);
        if (getToken(2).text.toLowerCase() !== "to") throw new LangError(`Expected "to".`, getToken(2)?.position, getToken(2)?.position + getToken(2).text.length - 1);
        if (getToken(3).text !== "[") throw new LangError(`Missing "[".`, getToken(3).position, getToken(3).position);
        if (getToken(tokens.length - 1).text !== "]") throw new LangError(`Missing "]".`, tokens[tokens.length - 1]?.position, tokens[tokens.length - 1]?.position);
        if (expression.length === 0) throw new LangError(`Expected an expression inside "[]".`, getToken(3).position, tokens[tokens.length - 1].position);




        const value = evaluate(parse(expression), variables);

        variables[getToken(1).text.toLowerCase()] = value;
        return true;
    }

    if (tokens[0]?.text.toLowerCase() === "change") {
        const start = getToken(3).text === "[" ? 4 : 5;
        const expression = tokens.slice(start, tokens.length - 1);

        // change <name> by <?op>[<expression>]
        if (getToken(1).kind !== "name") throw new LangError(`Expected a variable name.`, getToken(1)?.position, getToken(1)?.position + getToken(1)?.text.length - 1);
        if (getToken(2).text.toLowerCase() !== "by") throw new LangError(`Expected "by".`, getToken(2)?.position, getToken(2)?.position + getToken(2).text.length - 1);
        if (start === 5 && (getToken(3).text === "*" || getToken(3).text === "/" || getToken(3).text === "^") && variables[getToken(1).text.toLowerCase()] === undefined) throw new LangError(`Can't use "${getToken(3).text}" on "${getToken(1).text}" before it has a value.`, getToken(1).position, getToken(1).position);
        if (getToken(start - 1).text !== "[") throw new LangError(`Missing "[".`, getToken(start - 1).position, getToken(start - 1).position);
        if (tokens[tokens.length - 1]?.text !== "]") throw new LangError(`Missing "]".`, tokens[tokens.length - 1]?.position, tokens[tokens.length - 1]?.position);
        if (expression.length === 0) throw new LangError(`Expected an expression inside "[]".`, getToken(start - 1).position, tokens[tokens.length - 1].position);



        const operator: string = start === 4 ? 'plus' : getToken(3)?.kind;
        const operation = mathOptions[operator];

        if (!operation) throw new LangError(`Unknown operator "${getToken(3)?.text}".`, getToken(3).position, getToken(3).position);

        const value = evaluate(parse(expression), variables);
        const oldValue = variables[getToken(1).text.toLowerCase()] ?? 0;


        const answer = operation(oldValue, value);

        variables[getToken(1).text.toLowerCase()] = answer;
        return true;
    }

    if (tokens[0]?.text.toLowerCase() === "print") {
        const expression = tokens.slice(2, tokens.length - 1);
        const expressions = [];

        let start = 0;

        let depth = 0;

        const commaTokens: Token[] = [];

        for (let i = 0; i < expression.length; i++) {
            const tokenKind = expression[i].kind;

            if (tokenKind === "lparen") depth += 1;
            if (tokenKind === "rparen") depth -= 1;

            if (depth === 0 && tokenKind === "comma") {
                expressions.push(expression.slice(start, i));
                commaTokens.push(expression[i]);
                start = i + 1;
            }
        }

        expressions.push(expression.slice(start));


        //print [<expression>]
        if (getToken(1).text !== "[") throw new LangError(`Missing "[".`, getToken(1).position, getToken(1).position);
        if (getToken(tokens.length - 1).text !== "]") throw new LangError(`Missing "]".`, tokens[tokens.length - 1]?.position, tokens[tokens.length - 1]?.position);
        if (expression.length === 0) throw new LangError(`Expected an expression inside "[]".`, getToken(1).position, tokens[tokens.length - 1].position);

        const commas = expressions.length - 1;

        expressions.forEach((segment, k) => {
            if (segment.length !== 0) return;

            const last = k === commas;
            const ba = last ? "after" : "before" // before / after
            const comma = last ? commaTokens[k - 1] : commaTokens[k];

            throw new LangError(`Expected a value ${ba} ",".`, comma.position, comma.position);
        })


        const values = expressions.map(expression => evaluate(parse(expression), variables));

        outputs.push({ kind: "print", output: values.join(" ") });
        return true;
    }

    return false;
}
