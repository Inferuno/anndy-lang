import { run } from "../lang/run.ts";
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

codeBox.addEventListener("input", () => {
    highlight.replaceChildren();

    const lines: string[] = codeBox.value.split("\n");
    lines.forEach((line, i) => {
        colorLine(line, highlight);
        if (i !== lines.length - 1) highlight.append("\n");
    });
    highlight.append(" ");

    syncScroll();
    updateLines();
});

codeBox.addEventListener("scroll", () => {
    syncScroll();
    updateLines();
});

updateLines()


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
    if (event.key !== "Tab" || event.shiftKey) return;

    event.preventDefault();

    if (!document.execCommand("insertText", false, "\t")) {
        codeBox.setRangeText("\t", codeBox.selectionStart, codeBox.selectionEnd, "end");
        codeBox.dispatchEvent(new Event("input"));
    }
});
