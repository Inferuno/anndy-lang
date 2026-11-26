import { run } from "../lang/run.ts";
import type { Run } from "../lang/run.ts";
import { colorLine } from "./colorer.ts";

const codeBox = document.querySelector<HTMLTextAreaElement>(".code")!;
const inputBox = document.querySelector<HTMLTextAreaElement>(".input")!;
const runBtn = document.querySelector<HTMLButtonElement>(".btn-run")!;
const outputBox = document.querySelector<HTMLPreElement>(".output")!;
const gutter = document.querySelector<HTMLPreElement>(".gutter")!;
const highlight = document.querySelector<HTMLPreElement>(".highlight")!;

function updateLines() {
    const count = codeBox.value.split("\n").length;
    gutter.textContent = Array.from({ length: count }, (_, i) => i + 1).join("\n");
}

function syncScroll() {
    highlight.scrollTop = codeBox.scrollTop;
    highlight.scrollLeft = codeBox.scrollLeft;
    gutter.scrollTop = codeBox.scrollTop;
}

let errors: Run[] = [];
let errorTimer: ReturnType<typeof setTimeout> | undefined;

function paint() {
    highlight.replaceChildren();

    const lines: string[] = codeBox.value.split("\n");

    lines.forEach((line, i) => {
        const found = errors.find(r => r.kind === "error" && r.line === i + 1);

        colorLine(line, highlight, found?.kind === "error" ? found : undefined);
        if (i !== lines.length - 1) highlight.append("\n");
    });
    highlight.append(" ");

    syncScroll();
}

codeBox.addEventListener("input", () => {
    paint();
    updateLines();

    clearTimeout(errorTimer);
    errorTimer = setTimeout(() => {
        errors = run(codeBox.value, inputBox.value);
        paint();
    }, 500)
});

codeBox.addEventListener("scroll", syncScroll);

updateLines();


runBtn.addEventListener("click", () => {
    const logs = run(codeBox.value, inputBox.value);
    outputBox.replaceChildren();

    logs.forEach((log, i) => {
        if (i > 0) outputBox.append("\n");

        const text = String(log.output);

        if (log.kind === "error") {
            const span = document.createElement("span");
            span.className = "error";
            span.textContent = text;
            outputBox.append(span);
        } else {
            outputBox.append(text);
        }
    });
});

codeBox.addEventListener("keydown", (event) => {
    if (event.key === "Backspace" && codeBox.selectionStart === codeBox.selectionEnd) {
        const cursor = codeBox.selectionStart;
        if (codeBox.value[cursor - 1] === "[" && codeBox.value[cursor] === "]") {
            event.preventDefault();

            codeBox.setSelectionRange(cursor - 1, cursor + 1);

            if (!document.execCommand("insertText", false, "")) {
                codeBox.setRangeText("", codeBox.selectionStart, codeBox.selectionEnd, "end");
                codeBox.dispatchEvent(new Event("input"));
            }

            return;
        }
    }
    if (event.key === "[") {
        event.preventDefault();

        if (!document.execCommand("insertText", false, "[]")) {
            codeBox.setRangeText("[]", codeBox.selectionStart, codeBox.selectionEnd, "end");
            codeBox.dispatchEvent(new Event("input"));
        }

        const cursor = codeBox.selectionStart;
        codeBox.setSelectionRange(cursor - 1, cursor - 1);
        return;
    }

    if (event.key === "]") {
        const cursor = codeBox.selectionStart;
        if (codeBox.value[cursor] === "]") {
            event.preventDefault();

            codeBox.setSelectionRange(cursor + 1, cursor + 1);
        }
    }

    if (event.key !== "Tab" || event.shiftKey) return;

    event.preventDefault();

    if (!document.execCommand("insertText", false, "\t")) {
        codeBox.setRangeText("\t", codeBox.selectionStart, codeBox.selectionEnd, "end");
        codeBox.dispatchEvent(new Event("input"));
    }
});
