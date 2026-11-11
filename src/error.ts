export class LangError extends Error {
    position: number;
    end: number;
    line?: number;

    constructor(message: string, position: number, end: number) {
        super(message);
        this.position = position;
        this.end = end;
    }
}