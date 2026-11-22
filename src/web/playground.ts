import { run } from "../lang/run.ts";

const codeBox = document.querySelector<HTMLTextAreaElement>("#body");
const runBtn = document.querySelector(".btn-run");
const docsBtn = document.querySelector(".btn-docs");
const githubBtn = document.querySelector(".btn-github");


if (!codeBox || !runBtn) throw new Error("CRITICAL: Missing codeBox or runBtn");

runBtn.addEventListener("click", () => {
    console.log(run(codeBox.value))
});
