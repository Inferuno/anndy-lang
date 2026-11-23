import { run } from "../lang/run.ts";

const codeBox = document.querySelector<HTMLTextAreaElement>(".code")!;
const inputBox = document.querySelector<HTMLTextAreaElement>(".input")!;
const runBtn = document.querySelector<HTMLButtonElement>(".btn-run")!;
const outputBox = document.querySelector<HTMLPreElement>(".output")!;
const gutter = document.querySelector<HTMLPreElement>(".gutter")!;

function updateLines() {
    if (!codeBox) return;
    const count = codeBox.value.split("\n").length;
    gutter.textContent = Array.from({ length: count }, (_, i) => i + 1).join("\n");
}

codeBox.addEventListener("input", updateLines);

codeBox.addEventListener("scroll", () => {
    gutter.scrollTop = codeBox.scrollTop;
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
