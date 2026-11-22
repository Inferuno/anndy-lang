import { run } from "./lang/run.ts";

const code = `
set x to [5]
print [x]
change x by [3]
print [x]
change x by *[2]
print [x]
change y by [-4]
print [y]
change z by *[2]
set to [5]
set x [5]
set x to 5
set x to []
print [2 + 3) * (4]
print [(2 + 3]
s x to [5]
print [u]
set x to [5 & 2]
SET A TO [10]
PRINT [a + x]
`;


run(code);
