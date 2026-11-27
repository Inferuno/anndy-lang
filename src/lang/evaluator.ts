import { LangError } from "./error.ts";
export type Tree = number | string | { name: string; position: number } | { op: string; left: Tree; right: Tree };

export const mathOptions: Partial<Record<string, (x: number, y: number) => number>> = {
    'plus': (x, y) => x + y,
    'minus': (x, y) => x - y,
    'asterisk': (x, y) => x * y,
    'slash': (x, y) => x / y,
    'caret': (x, y) => Math.pow(x, y)
};

/**
The evaluate function will turn a tree (equation) into a number (answer)

Input: A tree representing an equation.
Output: The evalution of the tree as a number.

Called by: main.ts (once per tree).

Errors:
- If you hand it a tree that has an operator not permited (or any random charactor) like "}" it will return: "Unknown operator "}""

Caveat:
- There is no divide by zero handelling, "6/0" returns Infinity and "0/0" returns NaN.
*/

export function evaluate(tree: Tree, variables: Partial<Record<string, number | string>>, start: number, end: number): number | string {
    if (typeof tree === "number" || typeof tree === "string") {
        return tree;
    }


    if ("name" in tree) {
        const value = variables[tree.name.toLowerCase()];
        if (value === undefined) throw new LangError(`"${tree.name}" was never set.`, tree.position, tree.name.length + tree.position - 1);
        return value;
    }
    const operator = tree.op;
    if (!mathOptions[operator]) throw new Error(`Unknown operator "${operator}".`);

    const leftValue = evaluate(tree.left, variables, start, end);
    const rightValue = evaluate(tree.right, variables, start, end);

    if (typeof leftValue === "string" && typeof rightValue === "string") {
        if (operator !== "plus") throw new LangError(`You cannot change a string this way.`, start, end);
        return leftValue + rightValue;
    }
    if (typeof leftValue === "string" || typeof rightValue === "string") throw new LangError(`You cannot change a string by a number.`, start, end);

    return mathOptions[operator](leftValue, rightValue);
}
